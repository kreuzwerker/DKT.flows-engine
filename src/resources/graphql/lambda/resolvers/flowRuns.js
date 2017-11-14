import uuid from 'uuid'
import _sortBy from 'lodash/sortBy'
import _flatten from 'lodash/flatten'
import { getFlowById, setFlowDraftState, updateFlow } from './flows'
import { batchGetStepByIds } from './steps'
import { batchGetServicesByIds } from './services'
import { S3, Lambda, StepFunctions } from '../../../../utils/aws'
import {
  createScheduledEvent,
  enableScheduledEvent,
  disableScheduledEvent,
  removeScheduledEvent
} from '../../../../utils/scheduledEvents'
import ASLGenerator from '../../../../utils/aslGenerator'
import { getFlowRunOutputKey } from '../../../../utils/helpers/flowRunHelpers'
import * as dbFlowRuns from '../../../dbFlowRuns/resolvers'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allFlowRuns() {
  return dbFlowRuns.allFlowRuns()
}

export function getFlowRunById(id) {
  return dbFlowRuns.getFlowRunById(id)
}

export function getFlowRunsByFlowId(flowId) {
  return dbFlowRuns.getFlowRunsByFlowId(flowId)
}

export async function getLastFlowRunByFlowId(flowId) {
  return dbFlowRuns.getLastFlowRunByFlowId(flowId)
}

function getFlowRunsData(dataKeys, status) {
  const s3 = S3(process.env.S3_BUCKET)
  return Promise.all(dataKeys.map((key) => {
    return s3.getObject({ Key: key }).catch(() => {
      console.log('Unable to get file', key)
      return {}
    })
  }))
    .then(data => data.map(d => (d.Body ? JSON.parse(d.Body) : null)))
    .then(data => data.filter(d => d !== null))
}

function getRunsFromFlowRunsData(flowRunsData) {
  return flowRunsData.map((data) => {
    const { logs } = data
    const currentStep = data.flowRun.flow.steps.find(step => parseInt(step.position, 10) === parseInt(data.currentStep, 10))

    const steps = Object.keys(logs.steps).map(id => ({
      status: logs.steps[id].status,
      message: logs.steps[id].message,
      finishedAt: logs.steps[id].finishedAt,
      position: logs.steps[id].position,
      id: id
    }))

    return {
      id: data.runId,
      status: data.status,
      currentStep: currentStep,
      logs: { steps },
      result: data.data,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt
    }
  })
}

// Get all runs from the given flowRun
export function getRuns(flowRun, args) {
  if (!flowRun.runs) return []
  const { runs } = flowRun
  const pagination = {
    start: args.offset,
    end: args.offset + args.limit || undefined
  }

  const paginatedRuns = runs
    .filter(run => (args.status ? run.status === args.status : true))
    .reverse()
    .slice(pagination.start, pagination.end)
  const dataKeys = paginatedRuns.map(run => getFlowRunOutputKey(flowRun, run.id))

  if (dataKeys.length <= 0) {
    return null
  }

  return getFlowRunsData(dataKeys, args.status)
    .then(flowRunsData => getRunsFromFlowRunsData(flowRunsData))
    .then(extendedRunsData =>
      // merge data from dynamoDB and s3
      paginatedRuns.map((run) => {
        const runData = extendedRunsData.find(er => er.id === run.id)
        return { ...run, ...runData }
      }))
}

// Get all runs from all flowRuns from the given flow
export async function getRunsForFlow(flow, args) {
  const flowRuns = await getFlowRunsByFlowId(flow.id)
  const pagination = {
    start: args.offset,
    end: args.offset + args.limit || undefined
  }
  // we need the flowRun object within the run object to get the outputKey later.
  // this allows us to only fetch the required (paginated) flowRun dataJSONs from S3
  const evert = flowRun => flowRun.runs.map(run => ({ ...run, flowRun }))
  let runsItems = _flatten(flowRuns.map(flowRun => evert(flowRun)))

  runsItems = _sortBy(runsItems, 'startedAt')
  runsItems = runsItems
    .filter(run => (args.status ? run.status === args.status : true))
    .reverse()
    .slice(pagination.start, pagination.end)

  const dataKeys = runsItems.map(run => getFlowRunOutputKey(run.flowRun, run.id))

  if (dataKeys.length <= 0) {
    return null
  }

  return getFlowRunsData(dataKeys, args.status)
    .then(flowRunsData => getRunsFromFlowRunsData(flowRunsData))
    .then(extendedRunsData =>
      // merge data from dynamoDB and s3
      runsItems.map((run) => {
        const runData = extendedRunsData.find(er => er.id === run.id)
        return { ...run, ...runData }
      }))
}

export async function getRunsForFlowCount(flow, args) {
  const runs = await getRunsForFlow(flow, args)
  return runs ? runs.length : 0
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlowRun(params, userId) {
  function getServicesIdsFromSteps(steps) {
    return steps.filter(step => step.service !== null).map(step => step.service)
  }

  function mergeServicesInSteps(steps, services) {
    return steps.map(step => ({
      ...step,
      service: services.filter(service => service.id === step.service)[0] || {}
    }))
  }

  function extendTasksWithActivities(services) {
    return Promise.all(services.map((service) => {
      if (!service.task) return Promise.resolve(service)
      return StepFunctions.createActivity({
        name: `${service.id}-activity-${uuid.v4()}`
      }).then(({ activityArn }) => ({ ...service, activityArn }))
    }))
  }

  try {
    let flow = await getFlowById(params.flow, userId)
    const steps = await batchGetStepByIds(flow.steps)
    const servicesIds = getServicesIdsFromSteps(steps)
    let services = servicesIds.length > 0 ? await batchGetServicesByIds(servicesIds) : []
    services = await extendTasksWithActivities(services, flow.id)

    flow = { ...flow, steps: mergeServicesInSteps(steps, services) }

    const stateMachineName = `${flow.name.replace(/\s/g, '')}_${uuid.v4()}`
    const newFlowRun = {
      id: uuid.v4(),
      status: 'pending',
      message: null,
      runs: [],
      runsCount: 0,
      active: true,
      scheduledTriggerArn: null,
      scheduledTriggerName: null,
      stateMachineArn: null,
      flow
    }

    const scheduledTriggerStep = flow.steps.find(step => step.service.scheduled)
    if (scheduledTriggerStep) {
      const interval = scheduledTriggerStep.configParams.find(param => param.fieldId === 'interval')
      const ruleName = `${newFlowRun.id}-scheduledTrigger`
      const payload = {
        configParams: scheduledTriggerStep.configParams,
        flowRun: { id: newFlowRun.id }
      }
      const ruleArn = await createScheduledEvent(
        ruleName,
        interval,
        scheduledTriggerStep.service,
        payload
      )

      newFlowRun.scheduledTriggerArn = ruleArn
      newFlowRun.scheduledTriggerName = ruleName
    }

    const stateMachineDefinition = await ASLGenerator(newFlowRun)

    const stateMachine = await StepFunctions.createStateMachine(
      stateMachineName,
      stateMachineDefinition
    )

    newFlowRun.stateMachineArn = stateMachine.stateMachineArn

    const flowRun = await dbFlowRuns.createFlowRun(newFlowRun)

    // Take flow out of draft state
    flowRun.flow = await setFlowDraftState(flow, false)

    return flowRun
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function updateFlowRun(flowRun) {
  const oldFlowRun = await getFlowRunById(flowRun.id)

  if (oldFlowRun.scheduledTriggerName && flowRun.active) {
    await enableScheduledEvent(oldFlowRun.scheduledTriggerName)
  } else if (oldFlowRun.scheduledTriggerName && !flowRun.active) {
    await disableScheduledEvent(oldFlowRun.scheduledTriggerName)
  }

  return dbFlowRuns.updateFlowRun(flowRun)
}

export async function startFlowRun({ id, payload }, flowRunInstance) {
  let flowRun = flowRunInstance

  try {
    if (!flowRun) {
      flowRun = await getFlowRunById(id)
    }

    if (!flowRun.active) {
      return {
        ...flowRun,
        status: 'error',
        message: 'FlowRun is not active'
      }
    }

    const triggerStep = flowRun.flow.steps.reduce((a, step) => {
      return step.service.type === 'TRIGGER' ? step : a
    }, {})

    await Lambda.invoke({
      FunctionName: triggerStep.service.arn,
      Payload: JSON.stringify({ flowRun, payload })
    })

    return Promise.all([
      getFlowRunById(id),
      updateFlow({ id: flowRun.flow.id, active: true }, false)
    ]).then(res => res[0])
  } catch (err) {
    return updateFlowRun({
      id,
      active: true,
      status: 'error',
      message: err,
      runs: flowRun.runs,
      runsCount: flowRun.runs.length
    })
  }
}

export function createAndStartFlowRun(args) {
  const { payload } = args
  delete args.payload
  return createFlowRun(args).then(flowRun => startFlowRun({ id: flowRun.id, payload }, flowRun))
}

export function deleteFlowRun(id) {
  return getFlowRunById(id)
    .then((flowRun) => {
      const { steps } = flowRun.flow
      const tasks = steps.filter(step => !!step.service.task).map(step => step.service)
      const scheduledTrigger = steps.find(step => step.service.scheduled)
      let removeScheduledTrigger

      if (scheduledTrigger) {
        const { scheduledTriggerName } = flowRun
        removeScheduledTrigger = removeScheduledEvent(
          scheduledTriggerName,
          scheduledTrigger.service
        )
      } else {
        removeScheduledTrigger = Promise.resolve()
      }

      return Promise.all([
        StepFunctions.deleteStateMachine(flowRun.stateMachineArn),
        StepFunctions.deleteActivities(tasks),
        dbFlowRuns.deleteFlowRun(id),
        removeScheduledTrigger
      ])
    })
    .then(() => ({ id }))
}
