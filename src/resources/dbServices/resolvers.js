import dynDB from '../../utils/dynamoDB'

export function allServices() {
  const table = process.env.DYNAMO_SERVICES
  return dynDB.scan(table).then(r => r.Items)
}

export function getServiceById(serviceId) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id: serviceId }
  }

  return dynDB.getItem(table, query).then(res => res.Item || null)
}

export function batchGetServicesByIds(servicesIds) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    RequestItems: {
      [table]: {
        Keys: servicesIds.map(id => ({ id }))
      }
    }
  }

  return dynDB.batchGetItem(query).then(res => res.Responses[table])
}

export function createService(service) {
  const table = process.env.DYNAMO_SERVICES
  return dynDB.putItem(table, service)
}

export function updateService(service) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id: service.id }
  }

  return dynDB.updateItem(table, query, service)
}

export function deleteService(id) {
  const table = process.env.DYNAMO_SERVICES
  const query = {
    Key: { id }
  }
  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
