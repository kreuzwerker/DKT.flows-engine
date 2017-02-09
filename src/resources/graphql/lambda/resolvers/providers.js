import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import dynDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allProviders() {
  const table = process.env.DYNAMO_PROVIDERS
  return dynDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
}


export function getProviderById(providerId) {
  const table = process.env.DYNAMO_PROVIDERS
  const params = {
    Key: { id: { S: providerId } }
  }

  return dynDB.getItem(table, params)
              .then(r => unmarshalItem(r.Item))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createProvider(provider) {
  const table = process.env.DYNAMO_PROVIDERS
  const newProvider = Object.assign({}, {
    id: uuid.v4(),
    name: null,
    group: null,
    description: null,
    icon: null,
    services: [null]
  }, provider)

  return dynDB.putItem(table, newProvider)
}


export function updateProvider(provider) {
  const table = process.env.DYNAMO_PROVIDERS
  const query = {
    Key: { id: { S: provider.id } }
  }

  return dynDB.updateItem(table, query, provider)
}


export function deleteProvider(id) {
  const table = process.env.DYNAMO_PROVIDERS
  const query = {
    Key: { id: { S: id } }
  }
  return dynDB.deleteItem(table, query)
              .then(() => ({ id }))
}
