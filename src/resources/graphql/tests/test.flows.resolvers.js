import dynDB from '../../../utils/dynamoDB'
import * as FlowsResolver from '../lambda/resolvers/flows'
import flowsTestData from './testData/flows.json'
import { deleteKeysFrom } from './helpers'


export default function () {
  describe('Queries', () => {
    it('allFlows() returns all flows correctly', async function () {
      const allFlows = await FlowsResolver.allFlows()

      expect(allFlows).to.have.length.of.at.least(flowsTestData.length)

      flowsTestData.forEach((testFlow) => {
        const returnedFlows = allFlows.filter(f => f.id === testFlow.id)
        const returnedFlow = returnedFlows[0]
        expect(returnedFlows).to.have.lengthOf(1)
        // createdAt and updateAt is handled by the dynamoDB util.
        // thats why we can ignore this at this point
        deleteKeysFrom(['createdAt', 'updatedAt'], testFlow, returnedFlow)
        expect(returnedFlow).to.deep.equal(testFlow)
      })
    })

    flowsTestData.forEach((flow) => {
      it(`getFlowById('${flow.id}') returns the correct flow`, async function () {
        const returnedFlow = await FlowsResolver.getFlowById(flow.id)

        expect(returnedFlow).to.not.be.empty
        deleteKeysFrom(['createdAt', 'updatedAt'], flow, returnedFlow)
        expect(returnedFlow).to.deep.equal(flow)
      })
    })
  })

  describe('Mutations', () => {
    const createTestFlow = Object.assign({}, flowsTestData[0], {
      id: 'createTestFlow133m8gu0lju'
    })
    const updateTestFlow = Object.assign({}, flowsTestData[0], {
      id: 'updateTestFlow133m8gu0lju'
    })
    const deleteTestFlow = Object.assign({}, flowsTestData[2], {
      id: 'deleteTestFlow133m8gu0lju'
    })

    before(async function () {
      await Promise.all([updateTestFlow, deleteTestFlow].map((flow) => {
        return dynDB.putItem(process.env.DYNAMO_FLOWS, flow)
      }))
    })

    it('createFlow(flow) is creating a new flow', async function () {
      const createdFlow = await FlowsResolver.createFlow(createTestFlow)

      expect(createdFlow).to.not.be.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], createTestFlow, createdFlow)
      expect(createdFlow).to.deep.equal(createTestFlow)
    })

    it('updateFlow(flow) is updating a existing flow', async function () {
      const newUpdateTestFlow = Object.assign({}, updateTestFlow, { name: 'updated!' })
      const updatedFlow = await FlowsResolver.updateFlow(newUpdateTestFlow)

      expect(updatedFlow).to.not.be.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], updatedFlow, newUpdateTestFlow)
      expect(updatedFlow).to.deep.equal(newUpdateTestFlow)
    })

    it('deleteFlow(flowId) is deleting a existing flow', async function () {
      const response = await FlowsResolver.deleteFlow(deleteTestFlow.id)
      expect(response).to.have.keys('id')
    })

    after(async function () {
      await Promise.all([createTestFlow, updateTestFlow].map((testFlow) => {
        return dynDB.deleteItem(process.env.DYNAMO_FLOWS, { Key: { id: { S: testFlow.id } } })
      }))
    })
  })
}
