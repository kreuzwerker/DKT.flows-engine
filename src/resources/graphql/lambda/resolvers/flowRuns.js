import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import { getFlowById } from './flows'
import { getStepById } from './steps'
import { getServiceById } from './services'
import dynDB from '../../../../utils/dynamoDB'


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
              .then(r => unmarshalItem(r.Item))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const newFlowRun = Object.assign({}, {
    id: uuid.v4(),
    status: null,
    message: null,
    currentState: null,
    flow: {}
  }, flowRun)

  try {
    let flow = await getFlowById(flowRun.flow),
        steps = await Promise.all(flow.steps.map(stepId => getStepById(stepId)))
    const stepsWithServices = steps.filter(step => (step.service !== null))
    const services = await Promise.all(stepsWithServices.map(step => getServiceById(step.service)))
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
  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
