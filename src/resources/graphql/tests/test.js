// import { promisifyLambda } from '../../../../lib/promisifier'
// import { handler } from '../lambda/index'
import seedTestdata from './seeder'
import dynDB from '../../../utils/dynamoDB'
import * as FlowsResolver from '../lambda/resolvers/flows'
import * as ProviderResolver from '../lambda/resolvers/providers'
import * as ServicesResolver from '../lambda/resolvers/services'
// import * as StepsResolver from '../lambda/resolvers/steps'
import flowsTestData from './flows.json'
import providersTestData from './providers.json'
import servicesTestData from './services.json'
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
    /**
     * ---- Flows Resolvers ----------------------------------------------------
     */
    describe('Flows', () => {
      describe('RootQueries', () => {
        const { RootQueries } = FlowsResolver

        it('allFlows() returns all flows correctly', async function () {
          const allFlows = await RootQueries.allFlows()

          expect(allFlows).to.have.length.of.at.least(flowsTestData.length)

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

            expect(returnedFlow).to.not.be.empty

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

            expect(returnedFlow).to.not.be.empty

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

          expect(createdFlow).to.not.be.empty

          createTestFlow.createdAt = createdFlow.createdAt
          createTestFlow.updatedAt = createdFlow.updatedAt

          expect(createdFlow).to.deep.equal(createTestFlow)
        })

        it('updateFlow(flow) is updating a existing flow', async function () {
          const newUpdateTestFlow = Object.assign({}, updateTestFlow, { name: 'updated!' })
          const updatedFlow = await FlowsResolver.updateFlow(newUpdateTestFlow)

          expect(updatedFlow).to.not.be.empty
          expect(updatedFlow.name).to.be.equal('updated!')

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


    /**
     * ---- Providers Resolvers ------------------------------------------------
     */
    describe('Providers', () => {
      describe('RootQueries', () => {
        const { RootQueries } = ProviderResolver

        it('allProviders() returns all providers correctly', async function () {
          const allProviders = await RootQueries.allProviders()

          expect(allProviders).to.have.length.of.at.least(providersTestData.length)

          providersTestData.forEach((testProvider) => {
            const returnedProvider = allProviders.filter(p => p.id === testProvider.id)

            expect(returnedProvider).to.have.lengthOf(1)

            testProvider.createdAt = returnedProvider[0].createdAt
            testProvider.updatedAt = returnedProvider[0].updatedAt

            expect(returnedProvider[0]).to.eql(testProvider)
          })
        })

        providersTestData.forEach((provider) => {
          it(`provider(_, { id: '${provider.id}' }) returns the correct provider`, async function () {
            const returnedProvider = await RootQueries.provider(null, { id: provider.id })

            expect(returnedProvider).to.not.be.empty

            provider.createdAt = returnedProvider.createdAt
            provider.updatedAt = returnedProvider.updatedAt

            expect(returnedProvider).to.eql(provider)
          })
        })
      })

      describe('Queries', () => {
        providersTestData.forEach((provider) => {
          it(`getProviderById('${provider.id}') returns the correct provider`, async function () {
            const returnedProvider = await ProviderResolver.getProviderById(provider.id)

            expect(returnedProvider).to.not.be.empty

            returnedProvider.updatedAt = provider.updatedAt
            returnedProvider.createdAt = provider.createdAt

            expect(returnedProvider).to.eql(provider)
          })
        })
      })

      describe('Mutations', () => {
        const createTestProvider = Object.assign({}, providersTestData[0], {
          id: 'createTestProvider3zlitjn'
        })
        const updateTestProvider = Object.assign({}, providersTestData[0], {
          id: 'updateTestProvider3zlitjn'
        })
        const deleteTestProvider = Object.assign({}, providersTestData[0], {
          id: 'deleteTestProvider3zlitjn'
        })

        before(async function () {
          await Promise.all([updateTestProvider, deleteTestProvider].map((provider) => {
            return dynDB.putItem(process.env.DYNAMO_PROVIDERS, provider)
          }))
        })

        it('createProvider(provider) is creating a new provider', async function () {
          const createdProvider = await ProviderResolver.createProvider(createTestProvider)

          expect(createdProvider).to.not.be.empty

          createTestProvider.createdAt = createdProvider.createdAt
          createTestProvider.updatedAt = createdProvider.updatedAt

          expect(createdProvider).to.eql(createTestProvider)
        })

        it('updateProvider(provider) is updating a existing provider', async function () {
          const newUpdateTestProvider = Object.assign({}, updateTestProvider, { name: 'updated!' })
          const updatedProvider = await ProviderResolver.updateProvider(newUpdateTestProvider)

          expect(updatedProvider).to.not.be.empty
          expect(updatedProvider.name).to.be.equal('updated!')

          newUpdateTestProvider.createdAt = updatedProvider.createdAt
          newUpdateTestProvider.updatedAt = updatedProvider.updatedAt

          expect(updatedProvider).to.eql(newUpdateTestProvider)
        })

        it('deleteProvider(providerId) is deleting a existing provider', async function () {
          const response = await ProviderResolver.deleteProvider(deleteTestProvider.id)

          expect(response).to.have.keys('id')
        })

        after(async function () {
          await Promise.all([createTestProvider, updateTestProvider].map((testProvider) => {
            const query = { Key: { id: { S: testProvider.id } } }
            return dynDB.deleteItem(process.env.DYNAMO_PROVIDERS, query)
          }))
        })
      })
    })


    /**
     * ---- Services Resolvers -------------------------------------------------
     */
    describe('Services', () => {
      describe('RootQueries', () => {
        const { RootQueries } = ServicesResolver

        it('allServices() returns all services correctly', async function () {
          const allServices = await RootQueries.allServices()

          expect(allServices).to.have.length.of.at.least(servicesTestData.length)

          servicesTestData.forEach((testService) => {
            const returnedService = allServices.filter(s => s.id === testService.id)

            expect(returnedService).to.have.length(1)

            testService.createdAt = returnedService[0].createdAt
            testService.updatedAt = returnedService[0].updatedAt

            expect(returnedService[0]).to.eql(testService)
          })
        })

        servicesTestData.forEach((service) => {
          it(`service(_, { id: '${service.id}'}) returns the correct service`, async function () {
            const returnedService = await RootQueries.service(null, { id: service.id })

            expect(returnedService).to.not.be.empty

            service.createdAt = returnedService.createdAt
            service.updatedAt = returnedService.updatedAt

            expect(returnedService).to.eql(service)
          })
        })
      })

      describe('Quries', () => {
        servicesTestData.forEach((service) => {
          it(`getServiceById('${service.id}') returns the correct service`, async function () {
            const returnedService = await ServicesResolver.getServiceById(service.id)

            expect(returnedService).to.not.be.empty

            service.createdAt = returnedService.createdAt
            service.updatedAt = returnedService.updatedAt

            expect(returnedService).to.eql(service)
          })
        })
      })

      describe('Mutations', () => {
        const createTestService = Object.assign({}, servicesTestData[0], {
          id: 'createTestService1wvcejt5'
        })
        const updateTestService = Object.assign({}, servicesTestData[0], {
          id: 'updateTestService1wvcejt5'
        })
        const deleteTestService = Object.assign({}, servicesTestData[0], {
          id: 'deleteTestService1wvcejt5'
        })

        before(async function () {
          await Promise.all([updateTestService, deleteTestService].map((service) => {
            return dynDB.putItem(process.env.DYNAMO_SERVICES, service)
          }))
        })

        it('createService(service) is creating a new service', async function () {
          const createdService = await ServicesResolver.createService(createTestService)

          expect(createdService).to.not.be.empty

          createTestService.updatedAt = createdService.updatedAt
          createTestService.createdAt = createdService.createdAt

          expect(createdService).to.eql(createTestService)
        })

        it('updateService(service) is updating a existing service', async function () {
          const newUpdateTestService = Object.assign({}, updateTestService, {
            name: 'updated!'
          })
          const updatedService = await ServicesResolver.updateService(newUpdateTestService)

          expect(updatedService).to.be.not.empty
          expect(updatedService.name).to.be.equal('updated!')

          newUpdateTestService.updatedAt = updatedService.updatedAt
          newUpdateTestService.createdAt = updatedService.createdAt

          expect(updatedService).to.eql(newUpdateTestService)
        })

        it('deleteService(serviceId) is deleting a existing provider', async function () {
          const response = await ServicesResolver.deleteService(deleteTestService.id)

          expect(response).to.have.keys('id')
        })

        after(async function () {
          await Promise.all([createTestService, updateTestService].map((testService) => {
            const query = { Key: { id: { S: testService.id } } }
            return dynDB.deleteItem(process.env.DYNAMO_SERVICES, query)
          }))
        })
      })
    })


    /**
     * ---- Steps Resolvers ----------------------------------------------------
     */
    describe('Steps', () => {
      // TODO
    })
  })
})
