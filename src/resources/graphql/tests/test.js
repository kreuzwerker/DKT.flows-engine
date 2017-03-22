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
process.env.S3_BUCKET = 'dkt.flow-engine.test'
process.env.STATE_MACHINE_TRIGGER_FUNCTION = 'DKT-flow-engine-Test-StateMachineTriggerFunction-1QORKAL7DLMI5'


describe('ƛ GraphQL', () => {
  before(async function () {
    await seedTestdata()
  })

  // describe('FlowRuns Resolvers', FlowRunsResolver)
  // describe('Flows Resolvers', FlowsResolver)
  // describe('Providers Resolvers', ProvidersResolver)
  // describe('Services Resolvers', ServicesResolver)
  // describe('Steps Resolvers', StepsResolver)

  describe('Handler', LambdaHandler)
})
