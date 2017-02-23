import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import dynDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allServices() {
  const table = process.env.DYNAMO_SERVICES
  return dynDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
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
export function createService(service) {
  const table = process.env.DYNAMO_SERVICES
  const newService = Object.assign({}, {
    id: uuid.v4(),
    name: null,
    description: null,
    type: null,
    provider: null,
    step: null
  }, service)
  return dynDB.putItem(table, newService)
}


export function updateService(service) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id: { S: service.id } }
  }

  return dynDB.updateItem(table, query, service)
}


export function deleteService(id) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id: { S: id } }
  }
  return dynDB.deleteItem(table, query)
              .then(() => ({ id }))
}
