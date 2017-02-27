import _flatten from 'lodash/flatten'
import dynDB from '../../../utils/dynamoDB'
import flows from './testData/flows.json'
import flowRuns from './testData/flowRuns.json'
import providers from './testData/providers.json'
import services from './testData/services.json'
import steps from './testData/steps.json'


function seedTestdata() {
  const {
    DYNAMO_FLOWS,
    DYNAMO_FLOW_RUNS,
    DYNAMO_PROVIDERS,
    DYNAMO_SERVICES,
    DYNAMO_STEPS
  } = process.env

  const seedFlows = flows.map(flow => dynDB.putItem(DYNAMO_FLOWS, flow))
  const seedFlowRuns = flowRuns.map(flowRun => dynDB.putItem(DYNAMO_FLOW_RUNS, flowRun))
  const seedProviders = providers.map(provider => dynDB.putItem(DYNAMO_PROVIDERS, provider))
  const seedServices = services.map(service => dynDB.putItem(DYNAMO_SERVICES, service))
  const seedSteps = steps.map(step => dynDB.putItem(DYNAMO_STEPS, step))

  return Promise.all(_flatten([seedFlows, seedFlowRuns, seedProviders, seedServices, seedSteps]))
}


export default seedTestdata
