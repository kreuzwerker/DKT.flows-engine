import { handler } from './lambda/index'

process.env.SPACY_SERVICE_URL = 'http://34.240.40.83:8080/ent'

describe('when passing valid input data', () => {
  let response = {}

  before(async () => {
    response = await handler('Apple is looking at buying U.K. startup for $1 billion', console)
    console.log('response', response)
  })

  it('returns json with entities', () => {
    expect(response).to.include.keys('ents')
  })
})
