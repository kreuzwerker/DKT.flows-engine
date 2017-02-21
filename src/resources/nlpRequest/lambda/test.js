import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'
import settings from '../../../../settings'

process.env.S3_BUCKET = 'dkt.flow-engine.test'
process.env.NLP_URL = 'http://kreuzwerker-dkt-nlp-loadbalancer-1465345853.eu-west-1.elb.amazonaws.com/e-nlp/namedEntityRecognition'
const NlpRequest = promisifyLambda(handler)


describe('ƛ NLPRequest', async function () {
  let result

  before(async function () {
    this.timeout(settings.tests.timout)
    result = await NlpRequest(event, { awsRequestId: 'fetchArticleTest' })
  })

  it('should return stringified JSON', function () {
    console.log(result)
    // TODO
  })
})
