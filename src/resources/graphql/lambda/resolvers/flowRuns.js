import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import { getFlowById } from './flows'
import { batchGetStepByIds } from './steps'
import { batchGetServicesByIds } from './services'
import dynDB from '../../../../utils/dynamoDB'
import S3 from '../../../../utils/s3'
import Lambda from '../../../../utils/lambda'
import StepFunctions from '../../../../utils/stepFunctions'
import timestamp from '../../../../utils/timestamp'
import ASLGenerator from '../../../../utils/aslGenerator'
import {
  getFlowRunOutputKey,
  createFlowRunDataParams,
  createFlowRunTriggerParams
} from '../../../../utils/helpers/flowRunHelpers'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allFlowRuns() {
  const table = process.env.DYNAMO_FLOW_RUNS
  return dynDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
}


export function getFlowRunById(flowId) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: { S: flowId } }
  }

  return dynDB.getItem(table, query)
              .then(r => (r.Item ? unmarshalItem(r.Item) : null))
}


export async function getRuns(flowRun, args) {
  if (!flowRun.runs) return null
  const { runs } = flowRun
  const s3 = S3(process.env.S3_BUCKET)

  const pagination = {
    start: args.offset,
    end: (args.offset + args.limit) || undefined
  }

  const dataKeys = runs.reverse()
                       .slice(pagination.start, pagination.end)
                       .map(runId => getFlowRunOutputKey(flowRun, runId))

  if (dataKeys.length <= 0) {
    return null
  }

  try {
    const flowRunsData = []
    await Promise.all(dataKeys.map((key) => {
      return s3.getObject({ Key: key })
        .then(data => flowRunsData.push(data))
        .catch(() => Promise.resolve())
    }))

    return flowRunsData.map((data) => {
      const parsedData = JSON.parse(data.Body)
      const logs = parsedData.logs

      const steps = Object.keys(logs.steps).map(id => ({
        status: logs.steps[id].status,
        message: logs.steps[id].message,
        finishedAt: logs.steps[id].finishedAt,
        position: logs.steps[id].position,
        id: id
      }))

      return ({
        id: parsedData.runId,
        status: parsedData.status,
        logs: { steps },
        result: parsedData.data,
        startedAt: parsedData.startedAt,
        finishedAt: parsedData.finishedAt
      })
    })
  } catch (err) {
    return err
  }
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlowRun(params) {
  const table = process.env.DYNAMO_FLOW_RUNS

  function getServicesIdsFromSteps(steps) {
    return steps.filter(step => (step.service !== null)).map(step => step.service)
  }

  function mergeServicesInSteps(steps, services) {
    return steps.map(step => Object.assign({}, step, {
      service: services.filter(service => (service.id === step.service))[0] || {}
    }))
  }

  try {
    let flow = await getFlowById(params.flow)
    const steps = await batchGetStepByIds(flow.steps)
    const servicesIds = getServicesIdsFromSteps(steps)
    const services = servicesIds.length > 0 ? await batchGetServicesByIds(servicesIds) : []

    flow = Object.assign({}, flow, { steps: mergeServicesInSteps(steps, services) })

    const stateMachineName = `${flow.name.replace(' ', '')}_${uuid.v4()}`
    const newFlowRun = {
      id: uuid.v4(),
      status: 'pending',
      message: null,
      runs: [],
      runsCount: 0,
      flow
    }

    const stateMachineDefinition = await ASLGenerator(newFlowRun)
    const stateMachine = await StepFunctions.createStateMachine(stateMachineName, stateMachineDefinition)

    newFlowRun.stateMachineArn = stateMachine.stateMachineArn

    return dynDB.putItem(table, newFlowRun)
  } catch (err) {
    return Promise.reject(err)
  }
}


export function updateFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: { S: flowRun.id } }
  }

  return dynDB.updateItem(table, query, flowRun)
}


export async function startFlowRun({ id, payload }, flowRunInstance) {
  const s3 = S3(process.env.S3_BUCKET)
  const status = 'running'
  const message = null
  let flowRun = flowRunInstance

  try {
    if (!flowRun) {
      flowRun = await getFlowRunById(id)
    }

    const runId = `${timestamp()}_${uuid.v4()}`
    flowRun.runs.push(runId)

    const flowRunData = createFlowRunDataParams(flowRun, runId, payload, status)
    const invokeParams = createFlowRunTriggerParams(flowRun, runId)

    return s3.putObject(flowRunData)
      .then(() => Lambda.invoke(invokeParams))
      .then(() => updateFlowRun({
        id, status, message,
        runs: flowRun.runs,
        runsCount: flowRun.runs.length
      }))
  } catch (err) {
    return updateFlowRun({ id,
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
  return createFlowRun(args)
    .then(flowRun => startFlowRun({ id: flowRun.id, payload }, flowRun))
}


export function deleteFlowRun(id) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const deleteQuery = { Key: { id: { S: id } } }

  return getFlowRunById(id)
    .then(flowRun => Promise.all([
      StepFunctions.deleteStateMachine(flowRun.stateMachineArn),
      dynDB.deleteItem(table, deleteQuery)
    ]))
    .then(() => ({ id }))
}
