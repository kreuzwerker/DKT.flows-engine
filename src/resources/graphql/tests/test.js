import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'
import seedTestdata from './seeder'
import ResolversTests from './test.resolvers'


process.env.DYNAMO_FLOWS = 'DKT-flow-engine-Test-GraphQLDynamoFlows-1O7M9YWZ9L4MI'
process.env.DYNAMO_FLOW_RUNS = 'DKT-flow-engine-Test-GraphQLDynamoFlowRuns-OMZE59HNGDLQ'
process.env.DYNAMO_PROVIDERS = 'DKT-flow-engine-Test-GraphQLDynamoProviders-AL9KCA0EVNVW'
process.env.DYNAMO_SERVICES = 'DKT-flow-engine-Test-GraphQLDynamoServices-1P378KM8C9AYW'
process.env.DYNAMO_STEPS = 'DKT-flow-engine-Test-GraphQLDynamoSteps-L5ZS4XOU9M6O'


const GraphQLLambda = promisifyLambda(handler)


describe('ƛ GraphQL', () => {
  before(async function () {
    await seedTestdata()
  })

  describe('Resolvers', ResolversTests)

  describe('Responses', () => {
    describe('when passing a valid event body', () => {
      let response = {}
      const validPayload = {
        query: 'query FlowQuery($id: ID) { Flow(id: $id) { id name description } }',
        operationName: 'FlowQuery',
        variables: { id: 'dontDeleteMel0179imlh0a73' }
      }

      before(async () => {
        response = await GraphQLLambda({ body: validPayload, verbose: false })
      })

      it('with status code 200', () => {
        expect(response).to.include.keys('statusCode')
        expect(response.statusCode).to.equal(200)
      })

      it('with cors headers set', () => {
        expect(response).to.include.keys('headers')
        expect(response.headers).to.include.keys([
          'Access-Control-Allow-Methods',
          'Access-Control-Allow-Headers',
          'Access-Control-Allow-Origin'
        ])

        expect(response.headers['Access-Control-Allow-Methods']).to.equal('DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT')
        expect(response.headers['Access-Control-Allow-Headers']).to.equal('Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token')
        expect(response.headers['Access-Control-Allow-Origin']).to.equal('*')
      })

      it('with a stringified json as response body', () => {
        let json = {}
        expect(() => (json = JSON.parse(response.body))).to.not.throw(Error)
        expect(json).to.include.keys('data')
      })
    })

    describe('when passing an invalid event body', () => {
      let response = {}
      const invalidPayload = {
        query: 'query FlowsQueries($id: ID) { Flows(id: $id) { id name description } }',
        operationName: 'FlowsQueries',
        variables: { id: 'dontDeleteMel0179imlh0a73' }
      }

      before(async () => {
        response = await GraphQLLambda({ body: invalidPayload, verbose: false })
      })

      it('with status code 500', () => {
        expect(response).to.include.keys('statusCode')
        expect(response.statusCode).to.equal(500)
      })

      it('with cors headers set', () => {
        expect(response).to.include.keys('headers')
        expect(response.headers).to.include.keys([
          'Access-Control-Allow-Methods',
          'Access-Control-Allow-Headers',
          'Access-Control-Allow-Origin'
        ])

        expect(response.headers['Access-Control-Allow-Methods']).to.equal('DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT')
        expect(response.headers['Access-Control-Allow-Headers']).to.equal('Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token')
        expect(response.headers['Access-Control-Allow-Origin']).to.equal('*')
      })

      it('with a stringified json as response body', () => {
        let json = {}
        expect(() => (json = JSON.parse(response.body))).to.not.throw(Error)
        expect(json).to.include.keys('errors')
      })
    })
  })
})
