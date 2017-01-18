import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'
import event2 from './event2.json' // TODO


const graphQL = promisifyLambda(handler)


describe('ƛ GraphQL', function () {
  it('does not throw an error', function () {
    expect(async () => {
      graphQL(event, { awsRequestId: 'getServicesTest' })
    }).to.not.throw(Error)
  })

  describe('returns', function () {
    let result

    before(async function () {
      result = await graphQL(event2, { awsRequestId: 'getServicesTest' })
    })

    it('a list of Lambda Functions with all required parameters', function () {
      const json = JSON.parse(result)
      expect(json.data.allServices).to.be.instanceof(Array)
      json.data.allServices.forEach(service => expect(service).has.keys([
        'id',
        'name',
        'provider'
      ]))
    })
  })
})
