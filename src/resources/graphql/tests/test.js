import { seedTestdata, clearTestdata } from './seeder'
import StepsTests from './test.steps'
import ServicesTests from './test.services'
import ProvidersTests from './test.providers'
import FlowsTests from './test.flows'
import HandlerTest from './test.handler'


process.env.DYNAMO_FLOW_RUNS = 'DKT-flow-engine-Test-DynamoDBFlowRuns-9IOLO7TSOQRO'
process.env.DYNAMO_FLOWS = 'DKT-flow-engine-Test-DynamoDBFlows-1VLWJ5E7JM9T0'
process.env.DYNAMO_PROVIDERS = 'DKT-flow-engine-Test-DynamoDBProviders-6UD13CDNTONI'
process.env.DYNAMO_SERVICES = 'DKT-flow-engine-Test-DynamoDBServices-1KTZPGPZJI9W2'
process.env.DYNAMO_STEPS = 'DKT-flow-engine-Test-DynamoDBSteps-9LFCAR2Q3GTI'

process.env.S3_BUCKET = 'dkt.flow-engine.test'
process.env.STATE_MACHINE_TRIGGER_FUNCTION = 'DKT-flow-engine-Test-StateMachineTriggerFunction-1QORKAL7DLMI5'


describe('ƛ GraphQL', () => {
  before(async function () {
    await seedTestdata()
  })

  describe('Response', HandlerTest)
  describe('Flows', FlowsTests)
  describe('Providers', ProvidersTests)
  describe('Services', ServicesTests)
  describe('Steps', StepsTests)

  // TODO test FlowRuns

  after(async function () {
    await clearTestdata()
  })
})
