import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allProviders: () => {
    const table = process.env.DYNAMO_PROVIDERS
    return dynDB.scan(table)
                .then(r => r.Items.map(unmarshalItem))
  },

  provider: (_, { id }) => {
    const table = process.env.DYNAMO_PROVIDERS
    const query = { Key: { id: { S: id } } }

    return dynDB.getItem(table, query)
                .then(r => unmarshalItem(r.Item))
  }
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
  return dynDB.putItem(table, provider)
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
