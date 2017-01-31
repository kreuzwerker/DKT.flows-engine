import { unmarshalItem } from 'dynamodb-marshaler'
import dDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allProviders: () => {
    const table = process.env.DYNAMO_PROVIDERS
    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  provider: (_, { id }) => {
    const table = process.env.DYNAMO_PROVIDERS
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  }
}


export function getProviderById(providerId) {
  const table = process.env.DYNAMO_PROVIDERS
  const params = {
    Key: { id: { S: providerId } }
  }

  return dDB.getItem(table, params)
            .then(r => unmarshalItem(r.Item))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// TODO
