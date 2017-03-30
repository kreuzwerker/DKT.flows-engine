import _find from 'lodash/find'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testResults from './testData/providers.results.json'


const GraphQLLambda = promisifyLambda(handler)


export default function () {
  describe('Querying', () => {
    it('all Providers returns all Providers with requested Data', async () => {
      const expectedResult = testResults.allProviders
      const payload = JSON.stringify({
        query: 'query ProvidersQuery { allProviders { id name description icon group services { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } }',
        operationName: 'ProvidersQuery'
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { allProviders } = JSON.parse(response.body).data

      expect(allProviders).to.have.length.of.at.least(expectedResult.length)

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
        query: 'query ProviderQuery($id: ID!) { Provider(id: $id) { id name description icon group services { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } }',
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
}
