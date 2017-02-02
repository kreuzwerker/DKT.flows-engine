import _flatten from 'lodash/flatten'
import dynDB from '../../../utils/dynamoDB'
import flows from './flows.json'
import providers from './providers.json'
import services from './services.json'
import steps from './steps.json'


function seedTestdata() {
  const {
    DYNAMO_FLOWS,
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


export default seedTestdata
