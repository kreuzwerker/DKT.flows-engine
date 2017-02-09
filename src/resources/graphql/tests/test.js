import { astFromValue } from 'graphql'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import seedTestdata from './seeder'
// import event from './testEvents/event.json'
import ResolversTests from './test.resolvers'


process.env.DYNAMO_FLOWS = 'DKT-flow-engine-Test-GraphQLDynamoFlows-1O7M9YWZ9L4MI'
process.env.DYNAMO_PROVIDERS = 'DKT-flow-engine-Test-GraphQLDynamoProviders-AL9KCA0EVNVW'
process.env.DYNAMO_SERVICES = 'DKT-flow-engine-Test-GraphQLDynamoServices-1P378KM8C9AYW'
process.env.DYNAMO_STEPS = 'DKT-flow-engine-Test-GraphQLDynamoSteps-L5ZS4XOU9M6O'


const GraphQLLambda = promisifyLambda(handler)


describe('ƛ GraphQL', () => {
  before(async function () {
    await seedTestdata()
  })

  // describe('Resolvers', ResolversTests)

  describe('createStep', () => {
    const createStepPayload = {
      query: `
        mutation createStep(
          $pos: Int,
          $desc: String,
          $flow: ID,
          $service: ID
        ) {
          createStep(
            position: $pos,
            description: $desc,
            flow: $flow,
            service: $service
          ) {
            id
            position
            description
            flow {
              id
            }
            service {
              id
            }
          }
        }
      `,
      operationName: 'createStep',
      variables: {
        pos: 1,
        desc: 'Lorem Ipsum',
        flow: 'dontDeleteMel0179imlh0a73',
        service: 'dontDeleteMeh0133z9r38ljg'
      }
    }

    it('works', async () => {
      await GraphQLLambda({ body: createStepPayload, verbose: true })
    })
  })
})
