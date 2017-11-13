import { DynamoDB } from '../../utils/aws'

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

  return DynamoDB.scan(table, params).then(r => r.Items)
}

export function getFlowById(flowId, userId) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: flowId }
  }

  return DynamoDB.getItem(table, query).then((r) => {
    const item = r.Item || {}
    return item.userId === userId || item.userId === null ? item : null
  })
}

export function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  return DynamoDB.putItem(table, flow)
}

export function updateFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: flow.id }
  }

  return DynamoDB.updateItem(table, query, flow)
}

export function deleteFlow(id) {
  const table = process.env.DYNAMO_FLOWS
  const query = { Key: { id } }

  return DynamoDB.deleteItem(table, query)
}
