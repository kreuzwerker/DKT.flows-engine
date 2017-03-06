import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import { getFlowById } from './flows'
import { batchGetStepByIds } from './steps'
import { batchGetServicesByIds } from './services'
import dynDB from '../../../../utils/dynamoDB'
import S3 from '../../../../utils/s3'
import Lambda from '../../../../utils/lambda'


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
export async function createFlowRun(flowRun) {
  // TODO enhance this with a ASL generator to create flowRun state machines
  const table = process.env.DYNAMO_FLOW_RUNS
  const newFlowRun = Object.assign({}, {
    id: uuid.v4(),
    status: 'pending',
    stateMachine: null,
    message: null,
    currentStep: 0
  }, flowRun)

  console.log(newFlowRun)

  try {
    let flow = await getFlowById(flowRun.flow),
        steps = await batchGetStepByIds(flow.steps)
    const servicesIds = steps.filter(step => (step.service !== null))
                             .map(step => step.service)
    const services = servicesIds.length > 0 ? await batchGetServicesByIds(servicesIds) : []
    const getStepService = step => services.filter(s => (s.id === step.service))[0] || {}

    steps = steps.map(step => Object.assign({}, step, { service: getStepService(step) }))
    flow = Object.assign({}, flow, { steps })

    return dynDB.putItem(table, Object.assign({}, newFlowRun, { flow }))
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


export async function startFlowRun({ id, payload }) {
  try {
    const s3 = S3(process.env.S3_BUCKET)
    const flowRun = await getFlowRunById(id)

    const fileRunDataKey = `flows/${flowRun.flow.id}/flowRuns/${id}/in/${uuid.v1()}.json`
    const flowRunData = {
      flowRunId: id,
      data: payload,
      logs: {
        status: 'success',
        message: 'lorem ipsum'
      }
    }

    await s3.putObject({
      Key: fileRunDataKey,
      Body: JSON.stringify(flowRunData)
    })

    const triggerPayload = {
      stateMachine: 'HelloWorld', // TODO use real state machine
      key: fileRunDataKey,
      contentType: 'json',
      contentKey: 'data'
    }

    const lambdaInvokeResponse = await Lambda.invoke({
      ClientContext: 'ManualTrigger',
      FunctionName: process.env.STATE_MACHINE_TRIGGER_FUNCTION,
      InvocationType: 'Event',
      LogType: 'Tail',
      Payload: JSON.stringify(triggerPayload)
    })

    return updateFlowRun({ id, status: 'running' })
  } catch (err) {
    console.log(err)
    return updateFlowRun({ id, status: 'error', message: err })
  }
}


export function createAndStartFlowRun(args) {
  const { payload } = args
  delete args.payload
  return createFlowRun(args)
    .then(flowRun => startFlowRun({ id: flowRun.id, payload }))
}


export function deleteFlowRun(id) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = { Key: { id: { S: id } } }

  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
