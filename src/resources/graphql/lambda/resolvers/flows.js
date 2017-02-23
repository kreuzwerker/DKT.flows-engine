import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import { createStep } from './steps'
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
              .then(r => unmarshalItem(r.Item))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const newFlow = Object.assign({}, {
    id: uuid.v4(),
    name: null,
    description: null,
    steps: [null]
  }, flow)

  try {
    const newStep = await createStep({ flow: newFlow.id })
    const flowWithInitialStep = Object.assign({}, newFlow, { steps: [newStep.id] })

    return dynDB.putItem(table, flowWithInitialStep)
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
  const query = {
    Key: { id: { S: id } }
  }
  return dynDB.deleteItem(table, query)
              .then(() => ({ id }))
}
