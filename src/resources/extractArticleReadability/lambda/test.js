import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'
import settings from '../../../../settings'


process.env.S3_BUCKET = 'dkt.flow-engine.test'
const ExtractArticle = promisifyLambda(handler)


describe('ƛ ExtractArticleReadability', async function () {
  describe('extracted Article', function () {
    let article

    before(async function () {
      this.timeout(settings.tests.timeout)
      article = await ExtractArticle(event, { awsRequestId: 'extractArticleTest' })
    })

    it('should return stringified JSON', function () {
      expect(article).is.a('string')
      // should.doesNotThrow(() => JSON.parse(article))
    })
  })
})
