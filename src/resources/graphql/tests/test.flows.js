import _find from 'lodash/find'
import _sortBy from 'lodash/sortBy'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testResult from './testData/flows.results.json'


const GraphQLLambda = promisifyLambda(handler)


export default function () {
  describe('Querying', () => {
    it('all Flows returns all Flows with requested Data', async () => {
      const expectedResult = testResult.allFlows
      const payload = JSON.stringify({
        query: 'query FlowsQuery { allFlows { id name description steps { id description tested position configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } } }',
        operationName: 'FlowsQuery'
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { allFlows } = JSON.parse(response.body).data

      expect(allFlows).to.have.length.of.at.least(expectedResult.length)

      expectedResult.forEach((testFlow) => {
        const flow = _find(allFlows, { id: testFlow.id })

        expect(flow.id).to.equal(testFlow.id)
        expect(flow.name).to.equal(testFlow.name)
        expect(flow.description).to.equal(testFlow.description)

        const sortedFlowSteps = _sortBy(flow.steps, ['position'])
        const sortedTestFlowSteps = _sortBy(testFlow.steps, ['position'])

        expect(sortedFlowSteps).to.eql(sortedTestFlowSteps)
      })
    })

    it('one Flow returns the correct flow', async () => {
      const testFlow = testResult.Flow
      const payload = JSON.stringify({
        query: 'query FlowQuery($id: ID!) { Flow(id: $id) { id name description steps { id description tested position configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } } }',
        operationName: 'FlowQuery',
        variables: {
          id: 'dontDeleteMe20133m8gu0lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { Flow } = JSON.parse(response.body).data

      expect(Flow.id).to.equal(testFlow.id)
      expect(Flow.name).to.equal(testFlow.name)
      expect(Flow.description).to.equal(testFlow.description)

      const sortedFlowSteps = _sortBy(Flow.steps, ['position'])
      const sortedTestFlowSteps = _sortBy(testFlow.steps, ['position'])

      expect(sortedFlowSteps).to.eql(sortedTestFlowSteps)
    })
  })
}
