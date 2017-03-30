import _find from 'lodash/find'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testResults from './testData/steps.results.json'


const GraphQLLambda = promisifyLambda(handler)


export default function () {
  describe('Querying', () => {
    it('all Steps returns all Steps with requested Data', async () => {
      const expectedResult = testResults.allSteps
      const payload = JSON.stringify({
        query: 'query StepsQuery { allSteps { id description position tested configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } flow { id name description } } }',
        operationName: 'StepsQuery'
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { allSteps } = JSON.parse(response.body).data

      expect(allSteps).to.have.length.of.at.least(expectedResult.length)

      expectedResult.forEach((testStep) => {
        const step = _find(allSteps, { id: testStep.id })

        expect(step).to.eql(testStep)
      })
    })

    it('one Step returns the correct step', async () => {
      const testStep = testResults.Step
      const payload = JSON.stringify({
        query: 'query StepQuery($id: ID!) { Step(id: $id) { id description position tested configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } flow { id name description } } }',
        operationName: 'StepQuery',
        variables: {
          id: 'dontDeleteMe101795ez58bzs'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { Step } = JSON.parse(response.body).data

      expect(Step).to.eql(testStep)
    })
  })
}
