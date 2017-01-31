import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allServices: () => {
    const table = process.env.DYNAMO_SERVICES
    return dynDB.scan(table)
                .then(r => r.Items.map(unmarshalItem))
  },

  service: (_, { id }) => {
    const table = process.env.DYNAMO_SERVICES
    const query = { Key: { id: { S: id } } }

    return dynDB.getItem(table, query)
                .then(r => unmarshalItem(r.Item))
  }
}


export function getServiceById(serviceId) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id: { S: serviceId } }
  }

  return dynDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
}


export function batchGetServicesByIds(servicesIds) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    RequestItems: {
      [table]: {
        Keys: servicesIds.map(id => ({ id: { S: id } }))
      }
    }
  }

  return dynDB.batchGetItem(query)
              .then(res => res.Responses[table].map(unmarshalItem))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// TODO
