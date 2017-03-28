import uuid from 'uuid'
import * as dbProviders from '../../../dbProviders/resolvers'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allProviders() {
  return dbProviders.allProviders()
}


export function getProviderById(providerId) {
  return dbProviders.getProviderById(providerId)
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createProvider(provider) {
  const newProvider = Object.assign({}, {
    id: uuid.v4(),
    name: null,
    group: null,
    description: null,
    icon: null,
    services: [null]
  }, provider)

  return dbProviders.createProvider(newProvider)
}


export function updateProvider(provider) {
  return dbProviders.updateProvider(provider)
}


export function deleteProvider(id) {
  return dbProviders.deleteProvider(id)
}
