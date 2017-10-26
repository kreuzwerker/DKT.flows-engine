import dynDB from '../../utils/dynamoDB'

export function allFlows(userId) {
  const table = process.env.DYNAMO_FLOWS
  const params = {
    FilterExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId'
    },
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }

  return dynDB.scan(table, params).then(r => r.Items)
}

export function getFlowById(flowId, userId) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: flowId }
  }

  return dynDB.getItem(table, query).then((r) => {
    const item = r.Item || {}
    return item.userId === userId || item.userId === null ? item : null
  })
}

export function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  return dynDB.putItem(table, flow)
}

export function updateFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: flow.id }
  }

  return dynDB.updateItem(table, query, flow)
}

export function deleteFlow(id) {
  const table = process.env.DYNAMO_FLOWS
  const query = { Key: { id } }

  return dynDB.deleteItem(table, query)
}
