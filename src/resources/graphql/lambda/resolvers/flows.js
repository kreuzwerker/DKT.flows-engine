import { unmarshalItem } from 'dynamodb-marshaler'
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
export function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const newFlow = Object.assign({}, {
    name: null,
    description: null,
    steps: [null]
  }, flow)
  return dynDB.putItem(table, newFlow)
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
