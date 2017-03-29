import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../utils/dynamoDB'


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


export function createFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  return dynDB.putItem(table, flowRun)
}


export function updateFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: { S: flowRun.id } }
  }

  return dynDB.updateItem(table, query, flowRun)
}


export function deleteFlowRun(id) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const deleteQuery = { Key: { id: { S: id } } }

  dynDB.deleteItem(table, deleteQuery)
}
