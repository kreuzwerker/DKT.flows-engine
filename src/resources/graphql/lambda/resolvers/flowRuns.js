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
      stateMachine: stateMachineName,
      message: null,
      flow
    }

    const stateMachineDefinition = await ASLGenerator(newFlowRun)

    return Promise.all([
      StepFunctions.createStateMachine(stateMachineName, stateMachineDefinition),
      dynDB.putItem(table, newFlowRun)
    ]).then(res => res[1])
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
      message = null

  try {
    if (!flowRun) {
      flowRun = await getFlowRunById(id)
    }

    const runId = `${timestamp()}_${uuid.v4()}`
    const flowId = flowRun.flow.id
    const flowRunDataKey = `flows/${flowId}/flowRuns/${id}/in/${runId}.json`

    const flowRunData = {
      Key: flowRunDataKey,
      Body: JSON.stringify({
        flowRun: flowRun,
        currentStep: 0,
        data: payload,
        logs: { },
        status
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
        stateMachine: flowRun.stateMachine,
        currentStep: 0,
        contentType: 'json',
        contentKey: 'data'
      })
    }

    await s3.putObject(flowRunData)
    // await Lambda.invoke(invokeParams)
    return updateFlowRun({ id, status, message })
  } catch (err) {
    status = 'error'
    message = err
    return updateFlowRun({ id, status, message })
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
  const query = { Key: { id: { S: id } } }

  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
