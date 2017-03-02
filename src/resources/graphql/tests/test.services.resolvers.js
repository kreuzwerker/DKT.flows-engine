import dynDB from '../../../utils/dynamoDB'
import * as ServicesResolver from '../lambda/resolvers/services'
import servicesTestData from './testData/services.json'
import { deleteKeysFrom } from './helpers'


export default function () {
  describe('Quries', () => {
    it('allServices() returns all services correctly', async function () {
      const allServices = await ServicesResolver.allServices()

      expect(allServices).to.have.length.of.at.least(servicesTestData.length)

      servicesTestData.forEach((testService) => {
        const returnedService = allServices.filter(s => s.id === testService.id)

        expect(returnedService).to.have.length(1)
        deleteKeysFrom(['createdAt', 'updatedAt'], testService, returnedService[0])
        expect(returnedService[0]).to.eql(testService)
      })
    })

    servicesTestData.forEach((service) => {
      it(`getServiceById('${service.id}') returns the correct service`, async function () {
        const returnedService = await ServicesResolver.getServiceById(service.id)

        expect(returnedService).to.not.be.empty
        deleteKeysFrom(['createdAt', 'updatedAt'], returnedService, service)
        expect(returnedService).to.eql(service)
      })
    })
  })

  describe('Mutations', () => {
    const createTestService = Object.assign({}, servicesTestData[0], {
      id: 'createTestService1wvcejt5'
    })
    const updateTestService = Object.assign({}, servicesTestData[0], {
      id: 'updateTestService1wvcejt5'
    })
    const deleteTestService = Object.assign({}, servicesTestData[0], {
      id: 'deleteTestService1wvcejt5'
    })

    before(async function () {
      await Promise.all([updateTestService, deleteTestService].map((service) => {
        return dynDB.putItem(process.env.DYNAMO_SERVICES, service)
      }))
    })

    it('createService(service) is creating a new service', async function () {
      const createdService = await ServicesResolver.createService(createTestService)

      expect(createdService).to.not.be.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], createTestService, createdService)
      expect(createdService).to.eql(createTestService)
    })

    it('updateService(service) is updating a existing service', async function () {
      const newUpdateTestService = Object.assign({}, updateTestService, {
        name: 'updated!'
      })
      const updatedService = await ServicesResolver.updateService(newUpdateTestService)

      expect(updatedService).to.be.not.empty
      deleteKeysFrom(['createdAt', 'updatedAt'], updatedService, newUpdateTestService)
      expect(updatedService).to.eql(newUpdateTestService)
    })

    it('deleteService(serviceId) is deleting a existing provider', async function () {
      const response = await ServicesResolver.deleteService(deleteTestService.id)

      expect(response).to.have.keys('id')
    })

    after(async function () {
      await Promise.all([createTestService, updateTestService].map((testService) => {
        const query = { Key: { id: { S: testService.id } } }
        return dynDB.deleteItem(process.env.DYNAMO_SERVICES, query)
      }))
    })
  })
}
