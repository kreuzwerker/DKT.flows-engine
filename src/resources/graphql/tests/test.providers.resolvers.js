import dynDB from '../../../utils/dynamoDB'
import * as ProviderResolver from '../lambda/resolvers/providers'
import providersTestData from './testData/providers.json'
import { deleteKeysFrom } from './helpers'


export default function () {
  describe('Queries', () => {
    it('allProviders() returns all providers correctly', async function () {
      const allProviders = await ProviderResolver.allProviders()

      expect(allProviders).to.have.length.of.at.least(providersTestData.length)

      providersTestData.forEach((testProvider) => {
        const returnedProvider = allProviders.filter(p => p.id === testProvider.id)

        expect(returnedProvider).to.have.lengthOf(1)
        deleteKeysFrom(['createdAt', 'updatedAt'], testProvider, returnedProvider[0])
        expect(returnedProvider[0]).to.eql(testProvider)
      })
    })

    providersTestData.forEach((provider) => {
      it(`getProviderById('${provider.id}') returns the correct provider`, async function () {
        const returnedProvider = await ProviderResolver.getProviderById(provider.id)

        expect(returnedProvider).to.not.be.empty
        deleteKeysFrom(['createdAt', 'updatedAt'], provider, returnedProvider)
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
      deleteKeysFrom(['createdAt', 'updatedAt'], createTestProvider, createdProvider)
      expect(createdProvider).to.eql(createTestProvider)
    })

    it('updateProvider(provider) is updating a existing provider', async function () {
      const newUpdateTestProvider = Object.assign({}, updateTestProvider, { name: 'updated!' })
      const updatedProvider = await ProviderResolver.updateProvider(newUpdateTestProvider)

      expect(updatedProvider).to.not.be.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], newUpdateTestProvider, updatedProvider)
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
}
