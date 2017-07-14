import _find from 'lodash/find'
import dynDB from '../../../utils/dynamoDB'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import testData from './testData/providers.json'
import testResults from './testData/steps.results.json'

const GraphQLLambda = promisifyLambda(handler)

export default function () {
  describe('Querying', () => {
    it('all Steps returns all Steps with requested Data', async () => {
      const expectedResult = testResults.allSteps
      const payload = JSON.stringify({
        query:
          'query StepsQuery { allSteps { id description position tested configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } flow { id name description } } }',
        operationName: 'StepsQuery'
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const { allSteps } = JSON.parse(response.body).data

      expect(allSteps).to.have.lengthOf.at.least(expectedResult.length)

      expectedResult.forEach((testStep) => {
        const step = _find(allSteps, { id: testStep.id })

        expect(step).to.eql(testStep)
      })
    })

    it('one Step returns the correct step', async () => {
      const testStep = testResults.Step
      const payload = JSON.stringify({
        query:
          'query StepQuery($id: ID!) { Step(id: $id) { id description position tested configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } flow { id name description } } }',
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

  describe('Mutating', () => {
    const createTestData = Object.assign({}, testData[0], { id: 'createTestSteps8er430lju' })
    const updateTestData = Object.assign({}, testData[0], { id: 'updateTestSteps8er430lju' })
    const deleteTestData = Object.assign({}, testData[0], { id: 'deleteTestSteps8er430lju' })

    before(async function () {
      await Promise.all(
        [updateTestData, deleteTestData].map((flow) => {
          return dynDB.putItem(process.env.DYNAMO_STEPS, flow)
        })
      )
    })

    it('creating a Step creates a Step', async () => {
      const createTestResult = Object.assign({}, testResults.Step, {
        id: 'createTestSteps8er430lju',
        description: 'created Step',
        position: 4
      })
      const payload = JSON.stringify({
        query:
          'mutation CreateStep($id: ID, $position: Int, $description: String, $flow: ID, $service: ID) { createStep(id: $id, position: $position, description: $description, flow: $flow, service: $service) { id description position tested configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } flow { id name description } } }',
        operationName: 'CreateStep',
        variables: {
          id: 'createTestSteps8er430lju',
          description: 'created Step',
          position: 4,
          service: 'dontDeleteMel01791wvcejt5',
          flow: 'dontDeleteMe20133m8gu0lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const createdStep = JSON.parse(response.body).data.createStep

      expect(createdStep.id).to.equal(createTestResult.id)
      expect(createdStep.description).to.equal(createTestResult.description)
      expect(createdStep.position).to.equal(createTestResult.position)
      expect(createdStep.tested).to.equal(createTestResult.tested)
      expect(createdStep.service).to.eql(createTestResult.service)
      expect(createdStep.flow).to.eql(createTestResult.flow)
    })

    it('update a Step updates a Step', async () => {
      const updateTestResult = Object.assign({}, testResults.Step, {
        id: 'updateTestSteps8er430lju',
        description: 'updated Step',
        position: 5
      })
      const payload = JSON.stringify({
        query:
          'mutation UpdateStep($id: ID!, $position: Int, $description: String, $flow: ID, $service: ID) { updateStep(id: $id, position: $position, description: $description, flow: $flow, service: $service) { id description position tested configParams { fieldId value } service { id name type description arn configSchema { position fieldId label type defaultValue required } provider { description group icon id name } } flow { id name description } } }',
        operationName: 'UpdateStep',
        variables: {
          id: 'updateTestSteps8er430lju',
          description: 'updated Step',
          position: 5
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const updatedStep = JSON.parse(response.body).data.updateStep

      expect(updatedStep.id).to.equal(updateTestResult.id)
      expect(updatedStep.description).to.equal(updateTestResult.description)
      expect(updatedStep.position).to.equal(updateTestResult.position)
      expect(updatedStep.tested).to.equal(updateTestResult.tested)
    })

    it('deleting a Step deletes a existing step', async () => {
      const deleteTestResult = { id: 'deleteTestSteps8er430lju' }
      const payload = JSON.stringify({
        query: 'mutation DeleteStep($id: ID!) { deleteStep(id: $id) { id } }',
        operationName: 'DeleteStep',
        variables: {
          id: 'deleteTestSteps8er430lju'
        }
      })

      const response = await GraphQLLambda({ body: payload, verbose: false })
      const deleteStep = JSON.parse(response.body).data.deleteStep

      expect(deleteStep).to.have.keys('id')
      expect(deleteStep.id).to.equal(deleteTestResult.id)
    })

    after(async function () {
      await Promise.all(
        [createTestData, updateTestData].map((testStep) => {
          return dynDB.deleteItem(process.env.DYNAMO_STEPS, { Key: { id: { S: testStep.id } } })
        })
      )
    })
  })
}
