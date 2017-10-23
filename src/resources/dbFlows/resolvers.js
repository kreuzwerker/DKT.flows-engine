import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../utils/dynamoDB'

export function allFlows() {
  const table = process.env.DYNAMO_FLOWS
  return dynDB.scan(table).then(r => r.Items.map(unmarshalItem))
}

export function getFlowById(flowId) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: flowId }
  }

  return dynDB.getItem(table, query).then(r => r.Item || null)
}

export function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  return dynDB.putItem(table, flow)
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

  return dynDB.deleteItem(table, query)
}
