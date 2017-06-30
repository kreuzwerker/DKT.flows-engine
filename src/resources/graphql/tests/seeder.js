import _flatten from 'lodash/flatten'
import dynDB from '../../../utils/dynamoDB'
import flows from './testData/flows.json'
import providers from './testData/providers.json'
import services from './testData/services.json'
import steps from './testData/steps.json'

export function seedTestdata() {
  const {
    DYNAMO_FLOWS,
    DYNAMO_FLOW_RUNS,
    DYNAMO_PROVIDERS,
    DYNAMO_SERVICES,
    DYNAMO_STEPS
  } = process.env

  const seedFlows = flows.map(flow => dynDB.putItem(DYNAMO_FLOWS, flow))
  const seedProviders = providers.map(provider => dynDB.putItem(DYNAMO_PROVIDERS, provider))
  const seedServices = services.map(service => dynDB.putItem(DYNAMO_SERVICES, service))
  const seedSteps = steps.map(step => dynDB.putItem(DYNAMO_STEPS, step))

  return Promise.all(_flatten([seedFlows, seedProviders, seedServices, seedSteps]))
}

export function clearTestdata() {
  const {
    DYNAMO_FLOWS,
    DYNAMO_FLOW_RUNS,
    DYNAMO_PROVIDERS,
    DYNAMO_SERVICES,
    DYNAMO_STEPS
  } = process.env

  const seedFlows = flows.map((flow) => {
    return dynDB.deleteItem(DYNAMO_FLOWS, { Key: { id: { S: flow.id } } })
  })
  const seedProviders = providers.map((provider) => {
    return dynDB.deleteItem(DYNAMO_PROVIDERS, { Key: { id: { S: provider.id } } })
  })
  const seedServices = services.map((service) => {
    return dynDB.deleteItem(DYNAMO_SERVICES, { Key: { id: { S: service.id } } })
  })
  const seedSteps = steps.map((step) => {
    return dynDB.deleteItem(DYNAMO_STEPS, { Key: { id: { S: step.id } } })
  })

  return Promise.all(_flatten([seedFlows, seedProviders, seedServices, seedSteps]))
}
