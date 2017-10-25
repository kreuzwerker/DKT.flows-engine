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
