import { unmarshalItem } from 'dynamodb-marshaler'
import dDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allServices: () => {
    const table = process.env.DYNAMO_SERVICES
    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  service: (_, { id }) => {
    const table = process.env.DYNAMO_SERVICES
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  }
}


export function getServiceById(serviceId) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id: { S: serviceId } }
  }

  return dDB.getItem(table, query)
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

  return dDB.batchGetItem(query)
            .then(res => res.Responses[table].map(unmarshalItem))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// TODO
