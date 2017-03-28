import uuid from 'uuid'
import * as dbServices from '../../../dbServices/resolvers'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allServices() {
  return dbServices.allServices()
}


export function getServiceById(serviceId) {
  return dbServices.getServiceById(serviceId)
}


export function batchGetServicesByIds(servicesIds) {
  return dbServices.batchGetServicesByIds(servicesIds)
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createService(service) {
  const newService = Object.assign({}, {
    id: uuid.v4(),
    name: null,
    description: null,
    type: null,
    provider: null,
    step: null
  }, service)
  return dbServices.createService(newService)
}


export function updateService(service) {
  return dbServices.updateService(service)
}


export function deleteService(id) {
  return dbServices.deleteService(id)
}
