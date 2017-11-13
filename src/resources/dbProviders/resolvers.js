import { DynamoDB } from '../../utils/aws'

export function allProviders() {
  const table = process.env.DYNAMO_PROVIDERS
  return DynamoDB.scan(table).then(r => r.Items)
}

export function getProviderById(providerId) {
  const table = process.env.DYNAMO_PROVIDERS
  const params = {
    Key: { id: providerId }
  }

  return DynamoDB.getItem(table, params).then(r => r.Item || null)
}

export function createProvider(provider) {
  const table = process.env.DYNAMO_PROVIDERS
  return DynamoDB.putItem(table, provider)
}

export function updateProvider(provider) {
  const table = process.env.DYNAMO_PROVIDERS
  const query = {
    Key: { id: provider.id }
  }

  return DynamoDB.updateItem(table, query, provider)
}

export function deleteProvider(id) {
  const table = process.env.DYNAMO_PROVIDERS
  const query = {
    Key: { id }
  }
  return DynamoDB.deleteItem(table, query).then(() => ({ id }))
}
