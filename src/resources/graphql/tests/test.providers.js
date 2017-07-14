import _find from 'lodash/find'
import dynDB from '../../../utils/dynamoDB'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testData from './testData/providers.json'
import testResults from './testData/providers.results.json'

const GraphQLLambda = promisifyLambda(handler)

export default function () {
  describe('Querying', () => {
    it('all Providers returns all Providers with requested Data', async () => {
      const expectedResult = testResults.allProviders
      const payload = JSON.stringify({
        query:
          'query ProvidersQuery { allProviders { id name description icon group services { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } }',
        operationName: 'ProvidersQuery'
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { allProviders } = JSON.parse(response.body).data

      expect(allProviders).to.have.lengthOf.at.least(expectedResult.length)

      expectedResult.forEach((testProvider) => {
        const provider = _find(allProviders, { id: testProvider.id })

        expect(provider.id).to.equal(testProvider.id)
        expect(provider.name).to.equal(testProvider.name)
        expect(provider.description).to.equal(testProvider.description)
        expect(provider.group).to.equal(testProvider.group)
        expect(provider.icon).to.equal(testProvider.icon)

        expect(provider.services).to.deep.include.members(testProvider.services)
      })
    })

    it('one Provider returns the correct provider', async () => {
      const testProvider = testResults.Provider
      const payload = JSON.stringify({
        query:
          'query ProviderQuery($id: ID!) { Provider(id: $id) { id name description icon group services { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } }',
        operationName: 'ProviderQuery',
        variables: {
          id: 'dontDeleteMei0133gwr0g9i1'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { Provider } = JSON.parse(response.body).data

      expect(Provider.id).to.equal(testProvider.id)
      expect(Provider.name).to.equal(testProvider.name)
      expect(Provider.description).to.equal(testProvider.description)
      expect(Provider.group).to.equal(testProvider.group)
      expect(Provider.icon).to.equal(testProvider.icon)
      expect(Provider.services).to.deep.include.members(testProvider.services)
    })
  })

  describe('Mutating', () => {
    const createTestData = Object.assign({}, testData[0], { id: 'createTestProvider430lju' })
    const updateTestData = Object.assign({}, testData[0], { id: 'updateTestProvider430lju' })
    const deleteTestData = Object.assign({}, testData[0], { id: 'deleteTestProvider430lju' })

    before(async function () {
      await Promise.all(
        [updateTestData, deleteTestData].map((flow) => {
          return dynDB.putItem(process.env.DYNAMO_PROVIDERS, flow)
        })
      )
    })

    it('creating a Provider creates a new Provider', async () => {
      const createTestResult = Object.assign({}, testResults.allProviders[1], {
        id: 'createTestProvider430lju',
        name: 'Created-Provider',
        group: 'foobar',
        description: 'Lorem Ipsum',
        icon: 'mail'
      })
      const payload = JSON.stringify({
        query:
          'mutation CreateProvider($id: ID, $name: String, $group: String, $description: String, $icon: String, $services: [ID]) { createProvider(id: $id, name: $name, group: $group, description: $description, icon: $icon, services: $services) { id name description group icon services { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } }',
        operationName: 'CreateProvider',
        variables: {
          id: 'createTestProvider430lju',
          name: 'Created-Provider',
          group: 'foobar',
          description: 'Lorem Ipsum',
          icon: 'mail',
          services: []
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const createdProvider = JSON.parse(response.body).data.createProvider

      expect(createdProvider.id).to.equal(createTestResult.id)
      expect(createdProvider.name).to.equal(createTestResult.name)
      expect(createdProvider.description).to.equal(createTestResult.description)
      expect(createdProvider.group).to.equal(createTestResult.group)
      expect(createdProvider.icon).to.equal(createTestResult.icon)
    })

    it('update a Provider is updating a Provider', async () => {
      const updateTestResult = Object.assign({}, testResults.allProviders[1], {
        id: 'updateTestProvider430lju',
        name: 'Updated-Provider',
        group: 'FOOBAR',
        description: 'Lorem Ipsum dolor sit amed.',
        icon: 'rss'
      })
      const payload = {
        query:
          'mutation UpdateProvider($id: ID!, $name: String, $group: String, $description: String, $icon: String, $services: [ID]) { updateProvider(id: $id, name: $name, group: $group, description: $description, icon: $icon, services: $services) { id name description group icon services { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } }',
        operationName: 'UpdateProvider',
        variables: {
          id: 'updateTestProvider430lju',
          name: 'Updated-Provider',
          group: 'FOOBAR',
          description: 'Lorem Ipsum dolor sit amed.',
          icon: 'rss'
        }
      }

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const updatedProvider = JSON.parse(response.body).data.updateProvider

      expect(updatedProvider.id).to.equal(updateTestResult.id)
      expect(updatedProvider.name).to.equal(updateTestResult.name)
      expect(updatedProvider.description).to.equal(updateTestResult.description)
      expect(updatedProvider.group).to.equal(updateTestResult.group)
      expect(updatedProvider.icon).to.equal(updateTestResult.icon)
    })

    it('delete a Provider is deleting a existing provider', async () => {
      const deleteTestResult = { id: 'deleteTestProvider430lju' }
      const payload = JSON.stringify({
        query: 'mutation DeleteProvider($id: ID!) { deleteProvider(id: $id) { id } }',
        operationName: 'DeleteProvider',
        variables: {
          id: 'deleteTestProvider430lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const deleteProvider = JSON.parse(response.body).data.deleteProvider

      expect(deleteProvider).to.have.keys('id')
      expect(deleteProvider.id).to.equal(deleteTestResult.id)
    })

    after(async function () {
      await Promise.all(
        [createTestData, updateTestData].map((testProvider) => {
          return dynDB.deleteItem(process.env.DYNAMO_PROVIDERS, {
            Key: { id: { S: testProvider.id } }
          })
        })
      )
    })
  })
}
