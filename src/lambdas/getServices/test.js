import { promisifyLambda } from '../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'


const getServices = promisifyLambda(handler)


describe('ƛ GetServices', function () {
  it('runs', async function () {
    const res = await getServices(event, { awsRequestId: 'getServicesTest' })
    console.log(res)
  })
})
