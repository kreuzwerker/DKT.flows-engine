import dynDB from '../../../utils/dynamoDB'
import * as FlowRunsResolver from '../lambda/resolvers/flowRuns'
import flowRunsTestData from './testData/flowRuns.json'
import flowRunsMutationsTestData from './testData/flowRuns.mutations.json'
import { deleteKeysFrom } from './helpers'


function cleanFlowRuns(flowRun) {
  deleteKeysFrom(['createdAt', 'updatedAt'], flowRun)
  if (!flowRun.flow) return
  deleteKeysFrom(['createdAt', 'updatedAt'], flowRun.flow)
  if (!flowRun.flow.steps) return
  flowRun.flow.steps.forEach((step) => {
    deleteKeysFrom(['createdAt', 'updatedAt'], step)
    if (step.service) {
      deleteKeysFrom(['createdAt', 'updatedAt'], step.service)
    }
  })
}


export default function () {
  describe('Queries', () => {
    it('allFlowRuns() returns all flows correctly', async function () {
      const allFlowRuns = await FlowRunsResolver.allFlowRuns()

      expect(allFlowRuns).to.have.length.of.at.least(flowRunsTestData.length)

      flowRunsTestData.forEach((testFlowRun) => {
        const returnedFlowRuns = allFlowRuns.filter(f => f.id === testFlowRun.id)
        const returnedFlowRun = returnedFlowRuns[0]
        expect(returnedFlowRuns).to.have.lengthOf(1)
        cleanFlowRuns(returnedFlowRun)
        expect(returnedFlowRun).to.deep.equal(testFlowRun)
      })
    })

    flowRunsTestData.forEach((flowRun) => {
      it(`getFlowRunById('${flowRun.id}') returns the correct flowRun`, async function () {
        const returnedFlowRun = await FlowRunsResolver.getFlowRunById(flowRun.id)

        expect(returnedFlowRun).to.not.be.empty
        cleanFlowRuns(returnedFlowRun)
        deleteKeysFrom(['createdAt', 'updatedAt'], flowRun, returnedFlowRun)
        expect(returnedFlowRun).to.deep.equal(flowRun)
      })
    })
  })

  describe('Mutations', () => {
    const createTestFlowRun = flowRunsMutationsTestData[0]
    const createTestFlowRunResult = flowRunsMutationsTestData[1]
    const updateTestFlowRun = flowRunsMutationsTestData[2]
    const updateTestFlowRunResult = flowRunsMutationsTestData[3]
    const startFlowRunTestData = flowRunsTestData[0]
    const deleteTestFlowRun = flowRunsMutationsTestData[4]
    const createAndStartFlowRunData = flowRunsMutationsTestData[5]
    const createAndStartFlowRunResult = flowRunsMutationsTestData[6]


    it('createFlowRun(flowRun) is creating a new flowRun', async function () {
      const createdFlowRun = await FlowRunsResolver.createFlowRun(createTestFlowRun)

      expect(createdFlowRun).to.not.be.empty
      cleanFlowRuns(createdFlowRun)
      expect(createdFlowRun).to.deep.equal(createTestFlowRunResult)
    })

    it('updateFlowRun(flowRun) is updating a existing flowRun', async function () {
      const updatedFlowRun = await FlowRunsResolver.updateFlowRun(updateTestFlowRunResult)
      expect(updatedFlowRun).to.not.be.empty
      cleanFlowRuns(updatedFlowRun)
      expect(updatedFlowRun).to.deep.equal(updateTestFlowRunResult)
    })

    it('startFlowRun(flowRun) is starting a existing flowRun', async function () {
      const { id } = startFlowRunTestData
      const payload = 'foobar'
      const startedFlowRun = await FlowRunsResolver.startFlowRun({ id, payload })
      expect(startedFlowRun).to.not.be.empty
      expect(startedFlowRun.status).to.equal('running')
    })

    it('createAndStartFlowRun(flowRun) is creating and starging a new FlowRun', async function () {
      const createdAndStartedFlowRun = await FlowRunsResolver.createAndStartFlowRun(createAndStartFlowRunData)
      expect(createdAndStartedFlowRun).to.not.be.empty
      cleanFlowRuns(createdAndStartedFlowRun)
      expect(createdAndStartedFlowRun).to.deep.equal(createAndStartFlowRunResult)
    })

    it('deleteFlowRun(flowRunId) is deleting a existing flowRun', async function () {
      const response = await FlowRunsResolver.deleteFlowRun(deleteTestFlowRun.id)
      expect(response).to.have.keys('id')
    })

    after(async function () {
      await Promise.all([createTestFlowRun, updateTestFlowRun, createAndStartFlowRunData].map((testFlow) => {
        return dynDB.deleteItem(process.env.DYNAMO_FLOW_RUNS, { Key: { id: { S: testFlow.id } } })
      }))

      await dynDB.updateItem(process.env.DYNAMO_FLOW_RUNS, { Key: { id: { S: startFlowRunTestData.id } } }, { status: 'pending' })
    })
  })
}
