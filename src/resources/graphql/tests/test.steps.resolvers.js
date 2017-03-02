import dynDB from '../../../utils/dynamoDB'
import * as StepsResolver from '../lambda/resolvers/steps'
import stepsTestData from './testData/steps.json'
import { deleteKeysFrom } from './helpers'


export default function () {
  describe('Queries', () => {
    it('allSeps() returns all steps correctly', async function () {
      const allSteps = await StepsResolver.allSteps()

      expect(allSteps).to.have.length.of.at.least(stepsTestData.length)

      stepsTestData.forEach((testStep) => {
        const returnedStep = allSteps.filter(s => s.id === testStep.id)

        expect(returnedStep).to.have.length(1)
        deleteKeysFrom(['createdAt', 'updatedAt'], testStep, returnedStep[0])
        expect(returnedStep[0]).to.eql(testStep)
      })
    })

    stepsTestData.forEach((step) => {
      it(`getStepById('${step.id}') retuns the correct step`, async function () {
        const returnedStep = await StepsResolver.getStepById(step.id)

        expect(returnedStep).to.not.be.empty
        deleteKeysFrom(['createdAt', 'updatedAt'], step, returnedStep)
        expect(returnedStep).to.eql(step)
      })
    })
  })

  describe('Mutations', () => {
    const createTestStep = Object.assign({}, stepsTestData[0], {
      id: 'createTestStep1795ez58bzs'
    })
    const updateTestStep = Object.assign({}, stepsTestData[0], {
      id: 'updateTestStep1795ez58bzs'
    })
    const deleteTestStep = Object.assign({}, stepsTestData[0], {
      id: 'deleteTestStep1795ez58bzs'
    })

    before(async function () {
      await Promise.all([updateTestStep, deleteTestStep].map((step) => {
        return dynDB.putItem(process.env.DYNAMO_STEPS, step)
      }))
    })

    it('createStep(step) is creating a new Step', async function () {
      const createdStep = await StepsResolver.createStep(createTestStep)

      expect(createdStep).not.to.be.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], createdStep, createTestStep)
      expect(createdStep).to.eql(createTestStep)
    })

    it('updateStep(step) is updating existing Step', async function () {
      const newUpdateTestStep = Object.assign({}, updateTestStep, {
        description: 'updated!'
      })
      const updatedStep = await StepsResolver.updateStep(newUpdateTestStep)

      expect(updatedStep).not.to.be.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], updatedStep, newUpdateTestStep)
      expect(updatedStep).to.eql(newUpdateTestStep)
    })

    it('deleteStep(stepId) is deleting a existing provider', async function () {
      const response = await StepsResolver.deleteStep(deleteTestStep.id)

      expect(response).to.have.keys('id')
    })

    after(async function () {
      await Promise.all([createTestStep, updateTestStep].map((testStep) => {
        const query = { Key: { id: { S: testStep.id } } }
        return dynDB.deleteItem(process.env.DYNAMO_STEPS, query)
      }))
    })
  })
}
