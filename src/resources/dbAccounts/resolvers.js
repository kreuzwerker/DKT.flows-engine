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

export function createAccount(account) {
  const table = process.env.DYNAMO_ACCOUNTS
  return DynamoDB.putItem(table, account)
}

export function updateAccount(account) {
  const table = process.env.DYNAMO_ACCOUNTS
  const query = {
    Key: { id: account.id }
  }

  return DynamoDB.updateItem(table, query, account)
}

export function deleteAccount(id) {
  const table = process.env.DYNAMO_ACCOUNTS
  const deleteQuery = { Key: { id } }

  DynamoDB.deleteItem(table, deleteQuery)
}
