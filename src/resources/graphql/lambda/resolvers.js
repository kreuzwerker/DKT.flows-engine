import Flows from './mocks/flows.json'
import Providers from './mocks/providers.json'
import Services from './mocks/services.json'
import Steps from './mocks/steps.json'


/*
 * Root resolvers
 */
export const Query = {
  allFlows: () => Flows,
  flow: (_, { id }) => Flows.filter(s => s.id === id)[0],

  allProviders: () => Providers,
  provider: (_, { id }) => Providers.filter(s => s.id === id)[0],

  allServices: () => Services,
  service: (_, { id }) => Services.filter(s => s.id === id)[0],

  allSteps: () => Steps,
  step: (_, { id }) => Steps.filter(s => s.id === id)[0]
}


/*
 * Field resolvers
 */
export const flow = {
  steps: instance => Steps.filter(s => s.flow === instance.id)
}

export const provider = {
  services: instance => Services.filter((service) => {
    let match = false
    instance.services.forEach((s) => {
      if (s === service.id) match = true
    })
    return match
  })
}

export const service = {
  provider: instance => Providers.filter(p => p.id === instance.provider)[0],
  step: instance => Steps.filter(s => s.id === instance.step)[0]
}

export const step = {
  flow: instance => Flows.filter(f => f.id === instance.flow)[0],
  service: instance => Services.filter(f => f.id === instance.service)[0]
}
