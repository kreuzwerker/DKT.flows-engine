import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import { createStep, deleteStep } from './steps'
import dynDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allFlows() {
  const table = process.env.DYNAMO_FLOWS
  return dynDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
}


export function getFlowById(flowId) {
  const table = process.env.DYNAMO_FLOWS
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
export async function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  let newFlow = Object.assign({}, {
    id: uuid.v4(),
    name: null,
    description: null,
    steps: []
  }, flow)

  try {
    if (newFlow.steps.length === 0) {
      const newStep = await createStep({ flow: newFlow.id })
      newFlow = Object.assign({}, newFlow, { steps: [newStep.id] })
    }

    return dynDB.putItem(table, newFlow)
  } catch (err) {
    return Promise.reject(err)
  }
}


export function updateFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: { S: flow.id } }
  }

  return dynDB.updateItem(table, query, flow)
}


export function deleteFlow(id) {
  const table = process.env.DYNAMO_FLOWS
  const query = { Key: { id: { S: id } } }

  return getFlowById(id)
    .then(flow => Promise.all(flow.steps.map(stepId => deleteStep(stepId))))
    .then(() => dynDB.deleteItem(table, query))
    .then(() => ({ id }))
}
