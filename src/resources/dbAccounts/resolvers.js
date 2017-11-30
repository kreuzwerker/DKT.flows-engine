import { DynamoDB } from '../../utils/aws'

export function allAccounts(userId) {
  const table = process.env.DYNAMO_ACCOUNTS
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

export function getAccountById(id, userId) {
  const table = process.env.DYNAMO_ACCOUNTS
  const query = {
    Key: { id }
  }

  return DynamoDB.getItem(table, query).then((r) => {
    const item = r.Item || {}
    return typeof userId === 'undefined' || item.userId === userId || item.userId === null
      ? item
      : null
  })
}

