import uuid from 'uuid'
import _sortBy from 'lodash/sortBy'
import _flatten from 'lodash/flatten'
import { getFlowById, setFlowDraftState } from './flows'
import { batchGetStepByIds } from './steps'
import { batchGetServicesByIds } from './services'
import S3 from '../../../../utils/s3'
import Lambda from '../../../../utils/lambda'
import StepFunctions from '../../../../utils/stepFunctions'
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

// Get all runs from the given flowRun
export async function getRuns(flowRun, args) {
  if (!flowRun.runs) return []
  const { runs } = flowRun
  const s3 = S3(process.env.S3_BUCKET)

  const pagination = {
    start: args.offset,
    end: args.offset + args.limit || undefined
  }

  const dataKeys = runs
    .reverse()
    .slice(pagination.start, pagination.end)
    .map(run => getFlowRunOutputKey(flowRun, run.id))

  if (dataKeys.length <= 0) {
    return null
  }

  try {
    const flowRunsData = []
    await Promise.all(
      dataKeys.map((key) => {
        return s3
          .getObject({ Key: key })
          .then((data) => {
            const parsedData = JSON.parse(data.Body)

            if (!args.status || args.status === parsedData.status) {
              // Filter out runs that don't match the given status
              flowRunsData.push(parsedData)
            }
          })
          .catch((err) => {
            console.log(err)
            return Promise.resolve()
          })
      })
    )

    return flowRunsData.map((data) => {
      const logs = data.logs
      const currentStep = data.flowRun.flow.steps.find(
        step => parseInt(step.position, 10) === parseInt(data.currentStep, 10)
      )

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
  } catch (err) {
    return err
  }
}

// Get all runs from all flowRuns from the given flow
export async function getRunsForFlow(flow, args) {
  const flowRuns = await getFlowRunsByFlowId(flow.id)

  let runs = []
  await Promise.all(
    flowRuns.map((flowRun) => {
      return getRuns(flowRun, {
        offset: 0,
        status: args.status
      })
        .then((_runs) => {
          if (_runs) {
            runs = [...runs, ..._runs]
          }
        })
        .catch(() => Promise.resolve())
    })
  )

  const pagination = {
    start: args.offset,
    end: args.offset + args.limit || undefined
  }

  return _sortBy(runs, 'startedAt')
    .reverse()
    .slice(pagination.start, pagination.end)
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
    return Promise.all(
      services.map((service) => {
        if (!service.task) return Promise.resolve(service)
        return StepFunctions.createActivity({
          name: `${service.id}-activity-${uuid.v4()}`
        }).then(({ activityArn }) => ({ ...service, activityArn }))
      })
    )
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
      flow
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

export function updateFlowRun(flowRun) {
  return dbFlowRuns.updateFlowRun(flowRun)
}

export async function startFlowRun({ id, payload }, flowRunInstance) {
  let flowRun = flowRunInstance

  try {
    if (!flowRun) {
      flowRun = await getFlowRunById(id)
    }

    const triggerStep = flowRun.flow.steps.reduce((a, step) => {
      return step.service.type === 'TRIGGER' ? step : a
    }, {})

    await Lambda.invoke({
      FunctionName: triggerStep.service.arn,
      Payload: JSON.stringify({ flowRun, payload })
    })

    return getFlowRunById(id)
  } catch (err) {
    return updateFlowRun({
      id,
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

      return Promise.all([
        StepFunctions.deleteStateMachine(flowRun.stateMachineArn),
        StepFunctions.deleteActivities(tasks),
        dbFlowRuns.deleteFlowRun(id)
      ])
    })
    .then(() => ({ id }))
}
