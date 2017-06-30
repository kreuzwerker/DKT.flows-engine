import _find from 'lodash/find'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testResults from './testData/services.results.json'

const GraphQLLambda = promisifyLambda(handler)

export default function () {
  describe('Querying', () => {
    it('all Services returns all Services with requested Data', async () => {
      const expectedResult = testResults.allServices
      const payload = JSON.stringify({
        query:
          'query ServicesQuery { allServices { id name description type arn provider { id description name group icon } samplePayload configSchema { fieldId position label defaultValue type options { label value } } } }',
        operationName: 'ServicesQuery'
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { allServices } = JSON.parse(response.body).data

      expect(allServices).to.have.length.of.at.least(expectedResult.length)

      expectedResult.forEach((testService) => {
        const service = _find(allServices, { id: testService.id })

        expect(service).to.eql(testService)
      })
    })

    it('one Service returns the correct service', async () => {
      const testService = testResults.Service
      const payload = JSON.stringify({
        query:
          'query ServiceQuery($id: ID!) { Service(id: $id) { id name description type arn provider { id description name group icon } samplePayload configSchema { fieldId position required label defaultValue type options { label value } } } }',
        operationName: 'ServiceQuery',
        variables: {
          id: 'dontDeleteMel01791wvcejt5'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { Service } = JSON.parse(response.body).data

      expect(Service).to.eql(testService)
    })
  })
}
