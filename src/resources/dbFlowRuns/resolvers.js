import _sortBy from 'lodash/sortBy'
import dynDB from '../../utils/dynamoDB'

export function allFlowRuns() {
  const table = process.env.DYNAMO_FLOW_RUNS
  return dynDB.scan(table).then(r => r.Items)
}

export function getFlowRunById(id) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id }
  }

  return dynDB.getItem(table, query).then(res => res.Item || null)
}

export function getFlowRunsByFlowId(flowId) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const params = {
    FilterExpression: '#flow.#id = :flowId',
    ExpressionAttributeNames: {
      '#flow': 'flow',
      '#id': 'id'
    },
    ExpressionAttributeValues: {
      ':flowId': flowId
    }
  }
  return dynDB.scan(table, params).then(r => r.Items)
}

export async function getLastFlowRunByFlowId(flowId) {
  const items = await getFlowRunsByFlowId(flowId)

  // Return the last created flow run
  const sortedItems = _sortBy(items, item => item.updatedAt).reverse()
  return (sortedItems && sortedItems[0]) || null
}

export function createFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  return dynDB.putItem(table, flowRun)
}

export function updateFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: flowRun.id }
  }

  return dynDB.updateItem(table, query, flowRun)
}

export function deleteFlowRun(id) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const deleteQuery = { Key: { id } }

  dynDB.deleteItem(table, deleteQuery)
}
