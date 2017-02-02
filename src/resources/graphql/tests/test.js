// import { promisifyLambda } from '../../../../lib/promisifier'
// import { handler } from '../lambda/index'
import seedTestdata from './seeder'
import dynDB from '../../../utils/dynamoDB'
import * as FlowsResolver from '../lambda/resolvers/flows'
// import * as ProviderResolver from '../lambda/resolvers/providers'
// import * as ServicesResolver from '../lambda/resolvers/services'
// import * as StepsResolver from '../lambda/resolvers/steps'
import flowsTestData from './flows.json'
// import providersTestData from './providers.json'
// import servicesTestData from './services.json'
// import stepsTestData from './steps.json'
// import event from './testEvents/event.json'


process.env.DYNAMO_FLOWS = 'DKT-flow-engine-Test-GraphQLDynamoFlows-1O7M9YWZ9L4MI'
process.env.DYNAMO_PROVIDERS = 'DKT-flow-engine-Test-GraphQLDynamoProviders-AL9KCA0EVNVW'
process.env.DYNAMO_SERVICES = 'DKT-flow-engine-Test-GraphQLDynamoServices-1P378KM8C9AYW'
process.env.DYNAMO_STEPS = 'DKT-flow-engine-Test-GraphQLDynamoSteps-L5ZS4XOU9M6O'


// const GraphQLLambda = promisifyLambda(handler)


describe('ƛ GraphQL', () => {
  before(async function () {
    await seedTestdata()
  })

  describe('Resolvers', () => {
    describe('Flows', () => {
      describe('RootQueries', () => {
        const { RootQueries } = FlowsResolver

        it('allFlows() returns all flows correctly', async function () {
          const allFlows = await RootQueries.allFlows()

          expect(allFlows).to.have.length.of.at.least(2)

          flowsTestData.forEach((testFlow) => {
            const returnedFlow = allFlows.filter(f => f.id === testFlow.id)

            expect(returnedFlow).to.have.lengthOf(1)

            // createdAt and updateAt is handled by the dynamoDB util.
            // thats why we can ignore this at this point
            testFlow.createdAt = returnedFlow[0].createdAt
            testFlow.updatedAt = returnedFlow[0].updatedAt

            expect(returnedFlow[0]).to.deep.equal(testFlow)
          })
        })

        flowsTestData.forEach((flow) => {
          it(`flow(_, { id: '${flow.id}' }) returns the correct flow`, async function () {
            const returnedFlow = await RootQueries.flow(null, { id: flow.id })

            flow.createdAt = returnedFlow.createdAt
            flow.updatedAt = returnedFlow.updatedAt

            expect(returnedFlow).to.deep.equal(flow)
          })
        })
      })

      describe('Queries', () => {
        flowsTestData.forEach((flow) => {
          it(`getFlowById('${flow.id}') returns the correct flow`, async function () {
            const returnedFlow = await FlowsResolver.getFlowById(flow.id)

            flow.createdAt = returnedFlow.createdAt
            flow.updatedAt = returnedFlow.updatedAt

            expect(returnedFlow).to.deep.equal(flow)
          })
        })
      })

      describe('Mutations', () => {
        const createTestFlow = Object.assign({}, flowsTestData[0], {
          id: 'createTestFlow133m8gu0lju'
        })
        const updateTestFlow = Object.assign({}, flowsTestData[0], {
          id: 'updateTestFlow133m8gu0lju'
        })
        const deleteTestFlow = Object.assign({}, flowsTestData[0], {
          id: 'deleteTestFlow133m8gu0lju'
        })

        before(async function () {
          await Promise.all([updateTestFlow, deleteTestFlow].map((flow) => {
            return dynDB.putItem(process.env.DYNAMO_FLOWS, flow)
          }))
        })

        it('createFlow(flow) is creating a new flow', async function () {
          const createdFlow = await FlowsResolver.createFlow(createTestFlow)
          createTestFlow.createdAt = createdFlow.createdAt
          createTestFlow.updatedAt = createdFlow.updatedAt

          expect(createdFlow).to.deep.equal(createTestFlow)
        })

        it('updateFlow(flow) is updating a existing flow', async function () {
          const newUpdateTestFlow = Object.assign({}, updateTestFlow, { name: 'updated!' })
          const updatedFlow = await FlowsResolver.updateFlow(newUpdateTestFlow)
          newUpdateTestFlow.createdAt = updatedFlow.createdAt
          newUpdateTestFlow.updatedAt = updatedFlow.updatedAt

          expect(updatedFlow).to.deep.equal(newUpdateTestFlow)
        })

        it('deleteFlow(flowId) is deleting a existing flow', async function () {
          const response = await FlowsResolver.deleteFlow(deleteTestFlow.id)

          expect(response).to.have.keys('id')
        })

        after(async function () {
          await Promise.all([createTestFlow, updateTestFlow].map((testFlow) => {
            return dynDB.deleteItem(process.env.DYNAMO_FLOWS, { Key: { id: { S: testFlow.id } } })
          }))
        })
      })
    })


    describe('Providers', () => {
      // TODO
    })


    describe('Services', () => {
      // TODO
    })


    describe('Steps', () => {
      // TODO
    })
  })

  // describe('Query', () => {
  //   it('does not throw an error', async function () {
  //     const result = await GraphQLLambda(event, { awsRequestId: 'graphQlLambdaTest' })
  //     console.log(result)
  //   })
  // })
  //
  // describe('Mutations', () => {
  //   it('does not throw an error', async function () {
  //     const result = await GraphQLLambda(event, { awsRequestId: 'graphQlLambdaTest' })
  //     console.log(result)
  //   })
  // })
})
