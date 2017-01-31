import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'
import event2 from './event2.json'
import event3 from './event3.json'


process.env.DYNAMO_FLOWS = 'DKT-flow-engine-Dev-GraphQLDynamoFlows-13WW5Y7MSTLU7'
process.env.DYNAMO_PROVIDERS = 'DKT-flow-engine-Dev-GraphQLDynamoProviders-IUNVEF9DL2H8'
process.env.DYNAMO_SERVICES = 'DKT-flow-engine-Dev-GraphQLDynamoServices-9XJ1UPHZXYRF'
process.env.DYNAMO_STEPS = 'DKT-flow-engine-Dev-GraphQLDynamoSteps-164B3E7VEBZ1H'


const graphQL = promisifyLambda(handler)


describe('ƛ GraphQL', function () {
  describe('Query', function () {
    it('does not throw an error', function () {
      expect(async () => {
        await graphQL(event, { awsRequestId: 'getServicesTest' })
      }).to.not.throw(Error)
    })

    describe('returns', function () {
      let result

      before(async function () {
        result = await graphQL(event2, { awsRequestId: 'getServicesTest' })
      })

      it('a list of Services with all required parameters', function () {
        const json = JSON.parse(result.body)
        expect(json.data.allServices).to.be.instanceof(Array)
      })
    })
  })

  describe('Mutation', function () {
    it('does not throw an error', function () {
      expect(async () => {
        const res = await graphQL(event3, { awsRequestId: 'getServicesTest' })
        console.log(JSON.stringify(res, null, 2))
      }).to.not.throw(Error)
    })
  })
})
