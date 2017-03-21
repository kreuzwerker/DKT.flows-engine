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


export async function getRuns(flowRun) {
  if (!flowRun.runs) return null

  const s3 = S3(process.env.S3_BUCKET)
  const flowId = flowRun.flow.id
  const flowRunId = flowRun.id

  const flowRunDataKeys = flowRun.runs.map(runId => `flows/${flowId}/flowRuns/${flowRunId}/out/${runId}.json`)

  if (flowRunDataKeys.length <= 0) {
    return null
  }

  try {
    const flowRunsData = await Promise.all(flowRunDataKeys.map(key => s3.getObject({ Key: key })))
    return flowRunsData.map((data) => {
      const parsedData = JSON.parse(data.Body)
      const logs = parsedData.logs

      const steps = Object.keys(logs.steps).map(id => ({
        status: logs.steps[id].status,
        message: logs.steps[id].message,
        position: logs.steps[id].position,
        id: id
      }))

      return ({
        id: parsedData.runId,
        status: parsedData.status,
        logs: { steps }
      })
    })
  } catch (err) {
    return Promise.reject(err)
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
  let flowRun = flowRunInstance,
      status = 'running',
      message = null,
      runs = []

  try {
    if (!flowRun) {
      flowRun = await getFlowRunById(id)
    }

    const runId = `${timestamp()}_${uuid.v4()}`
    const flowId = flowRun.flow.id
    const flowRunDataKey = `flows/${flowId}/flowRuns/${id}/in/${runId}.json`
    runs = flowRun.runs.concat(runId)

    const flowRunData = {
      Key: flowRunDataKey,
      Body: JSON.stringify({
        flowRun: flowRun,
        currentStep: 0,
        data: payload,
        logs: { },
        status, runId
      })
    }

    const invokeParams = {
      ClientContext: 'ManualTrigger',
      FunctionName: process.env.STATE_MACHINE_TRIGGER_FUNCTION,
      InvocationType: 'Event',
      LogType: 'Tail',
      Payload: JSON.stringify({
        runId: runId,
        key: flowRunDataKey,
        stateMachineArn: flowRun.stateMachineArn,
        currentStep: 0,
        contentType: 'json',
        contentKey: 'data'
      })
    }

    await s3.putObject(flowRunData)
    await Lambda.invoke(invokeParams)
    return updateFlowRun({ id, status, message, runs })
  } catch (err) {
    status = 'error'
    message = err
    return updateFlowRun({ id, status, message, runs })
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
