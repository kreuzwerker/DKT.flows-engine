import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from '../lambda/index'


const GraphQLLambda = promisifyLambda(handler)


export default function () {
  describe('Responses', () => {
    describe('run query', () => {
      let response = {}
      const validPayload = {
        query: 'query FlowRunQuery($id: ID) { FlowRun(id: $id) { id status message userId runs { id status logs { steps { position status message } } } flow { id name description steps { id position service { id name arn type } } } } }',
        operationName: 'FlowRunQuery',
        variables: { id: '2160389f-b4ec-4365-9afc-e05e37e9a767' }
      }

      before(async () => {
        response = await GraphQLLambda({ body: validPayload, verbose: false })
      })

      it('with status code 200', () => {
        expect(response).to.include.keys('statusCode')
        expect(response.statusCode).to.equal(200)
        // console.log(JSON.stringify(JSON.parse(response.body).data, null, 2))
      })
    })

    //
    // describe('when passing a valid event body', () => {
    //   let response = {}
    //   const validPayload = {
    //     query: 'query FlowQuery($id: ID) { Flow(id: $id) { id name description } }',
    //     operationName: 'FlowQuery',
    //     variables: { id: 'dontDeleteMel0179imlh0a73' }
    //   }
    //
    //   before(async () => {
    //     response = await GraphQLLambda({ body: validPayload, verbose: false })
    //   })
    //
    //   it('with status code 200', () => {
    //     expect(response).to.include.keys('statusCode')
    //     expect(response.statusCode).to.equal(200)
    //   })
    //
    //   it('with cors headers set', () => {
    //     expect(response).to.include.keys('headers')
    //     expect(response.headers).to.include.keys([
    //       'Access-Control-Allow-Methods',
    //       'Access-Control-Allow-Headers',
    //       'Access-Control-Allow-Origin'
    //     ])
    //
    //     expect(response.headers['Access-Control-Allow-Methods']).to.equal('DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT')
    //     expect(response.headers['Access-Control-Allow-Headers']).to.equal('Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token')
    //     expect(response.headers['Access-Control-Allow-Origin']).to.equal('*')
    //   })
    //
    //   it('with a stringified json as response body', () => {
    //     let json = {}
    //     expect(() => (json = JSON.parse(response.body))).to.not.throw(Error)
    //     expect(json).to.include.keys('data')
    //   })
    // })
    //
    // describe('when passing an invalid event body', () => {
    //   let response = {}
    //   const invalidPayload = {
    //     query: 'query FlowsQueries($id: ID) { Flows(id: $id) { id name description } }',
    //     operationName: 'FlowsQueries',
    //     variables: { id: 'dontDeleteMel0179imlh0a73' }
    //   }
    //
    //   before(async () => {
    //     response = await GraphQLLambda({ body: invalidPayload, verbose: false })
    //   })
    //
    //   it('with status code 500', () => {
    //     expect(response).to.include.keys('statusCode')
    //     expect(response.statusCode).to.equal(500)
    //   })
    //
    //   it('with cors headers set', () => {
    //     expect(response).to.include.keys('headers')
    //     expect(response.headers).to.include.keys([
    //       'Access-Control-Allow-Methods',
    //       'Access-Control-Allow-Headers',
    //       'Access-Control-Allow-Origin'
    //     ])
    //
    //     expect(response.headers['Access-Control-Allow-Methods']).to.equal('DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT')
    //     expect(response.headers['Access-Control-Allow-Headers']).to.equal('Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token')
    //     expect(response.headers['Access-Control-Allow-Origin']).to.equal('*')
    //   })
    //
    //   it('with a stringified json as response body', () => {
    //     let json = {}
    //     expect(() => (json = JSON.parse(response.body))).to.not.throw(Error)
    //     expect(json).to.include.keys('errors')
    //   })
    // })
  })
}
