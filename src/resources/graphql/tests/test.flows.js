import _find from 'lodash/find'
import _sortBy from 'lodash/sortBy'
import dynDB from '../../../utils/dynamoDB'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testData from './testData/flows.json'
import testResult from './testData/flows.results.json'

const GraphQLLambda = promisifyLambda(handler)

export default function () {
  describe('Querying', () => {
    it('all Flows returns all Flows with requested Data', async () => {
      const expectedResult = testResult.allFlows
      const payload = JSON.stringify({
        query:
          'query FlowsQuery { allFlows { id name description steps { id description tested position configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } } }',
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
        query:
          'query FlowQuery($id: ID!) { Flow(id: $id) { id name description steps { id description tested position configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } } }',
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

  describe('Mutating', () => {
    const createTestData = Object.assign({}, testData[0], {
      id: 'createTestFlow133m8gu0lju',
      steps: []
    })
    const updateTestData = Object.assign({}, testData[0], {
      id: 'updateTestFlow133m8gu0lju',
      steps: []
    })
    const deleteTestData = Object.assign({}, testData[0], {
      id: 'deleteTestFlow133m8gu0lju',
      steps: []
    })
    let stepToDelete = ''

    before(async () => {
      await Promise.all(
        [updateTestData, deleteTestData].map((flow) => {
          return dynDB.putItem(process.env.DYNAMO_FLOWS, flow)
        })
      )
    })

    it('create a Flow is creating a new flow', async () => {
      const createTestResult = Object.assign({}, testResult.Flow, {
        name: 'first flow',
        description: 'This is a mocked flow object.',
        id: 'createTestFlow133m8gu0lju'
      })
      const payload = JSON.stringify({
        query:
          'mutation CreateFlow($id: ID, $name: String, $description: String) { createFlow(id: $id, name: $name, description: $description) { id name description steps { id description tested position configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } } }',
        operationName: 'CreateFlow',
        variables: {
          name: 'first flow',
          description: 'This is a mocked flow object.',
          id: 'createTestFlow133m8gu0lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const createdFlow = JSON.parse(response.body).data.createFlow

      expect(createdFlow.id).to.equal(createTestResult.id)
      expect(createdFlow.name).to.equal(createTestResult.name)
      expect(createdFlow.description).to.equal(createTestResult.description)

      expect(createdFlow.steps).to.have.length.of(1)
      stepToDelete = createdFlow.steps[0]
    })

    it('update a Flow is updating a existing flow', async () => {
      const updateTestResult = Object.assign({}, testResult.Flow, {
        id: 'updateTestFlow133m8gu0lju',
        name: 'updated flow',
        description: 'This is a updated flow object.'
      })
      const payload = JSON.stringify({
        query:
          'mutation UpdateFlow($id: ID!, $name: String, $description: String, $steps: [ID]) { updateFlow(id: $id, name: $name, description: $description, steps: $steps) { id name description steps { id description tested position configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } } } }',
        operationName: 'UpdateFlow',
        variables: {
          name: 'updated flow',
          description: 'This is a updated flow object.',
          id: 'updateTestFlow133m8gu0lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const updatedFlow = JSON.parse(response.body).data.updateFlow

      expect(updatedFlow.id).to.equal(updateTestResult.id)
      expect(updatedFlow.name).to.equal(updateTestResult.name)
      expect(updatedFlow.description).to.equal(updateTestResult.description)
    })

    it('delete a Flow is deleting a existing flow', async () => {
      const deleteTestResult = { id: 'deleteTestFlow133m8gu0lju' }
      const payload = JSON.stringify({
        query: 'mutation DeleteFlow($id: ID!) { deleteFlow(id: $id) { id } }',
        operationName: 'DeleteFlow',
        variables: {
          id: 'deleteTestFlow133m8gu0lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const deleteFlow = JSON.parse(response.body).data.deleteFlow

      expect(deleteFlow).to.have.keys('id')
      expect(deleteFlow.id).to.equal(deleteTestResult.id)
    })

    after(async () => {
      await Promise.all(
        [createTestData, updateTestData].map((testFlow) => {
          return dynDB.deleteItem(process.env.DYNAMO_FLOWS, { Key: { id: { S: testFlow.id } } })
        })
      )

      if (stepToDelete) {
        await dynDB.deleteItem(process.env.DYNAMO_STEPS, { Key: { id: { S: stepToDelete.id } } })
      }
    })
  })
}
