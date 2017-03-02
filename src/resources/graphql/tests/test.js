import seedTestdata from './seeder'
import LambdaHandler from './test.handler'
import FlowRunsResolver from './test.flowRuns.resolvers'
import FlowsResolver from './test.flows.resolvers'
import ProvidersResolver from './test.providers.resolvers'
import ServicesResolver from './test.services.resolvers'
import StepsResolver from './test.steps.resolvers'


process.env.DYNAMO_FLOWS = 'DKT-flow-engine-Test-GraphQLDynamoFlows-1O7M9YWZ9L4MI'
process.env.DYNAMO_FLOW_RUNS = 'DKT-flow-engine-Test-GraphQLDynamoFlowRuns-OMZE59HNGDLQ'
process.env.DYNAMO_PROVIDERS = 'DKT-flow-engine-Test-GraphQLDynamoProviders-AL9KCA0EVNVW'
process.env.DYNAMO_SERVICES = 'DKT-flow-engine-Test-GraphQLDynamoServices-1P378KM8C9AYW'
process.env.DYNAMO_STEPS = 'DKT-flow-engine-Test-GraphQLDynamoSteps-L5ZS4XOU9M6O'


describe('ƛ GraphQL', () => {
  before(async function () {
    await seedTestdata()
  })

  describe('FlowRuns Resolvers', FlowRunsResolver)
  describe('Flows Resolvers', FlowsResolver)
  describe('Providers Resolvers', ProvidersResolver)
  describe('Services Resolvers', ServicesResolver)
  describe('Steps Resolvers', StepsResolver)

  describe('Handler', LambdaHandler)
})
