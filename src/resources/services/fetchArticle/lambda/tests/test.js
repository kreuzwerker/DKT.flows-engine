import { promisifyLambda } from '../../../../../../lib/promisifier'
import { handler } from '../index'
import event from './event.json'
import settings from '../../../../../../settings'


process.env.S3_BUCKET = 'dkt.flow-engine.test'
const FetchArticle = promisifyLambda(handler)


describe('ƛ FetchArticle', async function () {
  let article

  before(async function () {
    this.timeout(settings.tests.timout)
    article = await FetchArticle(event, { awsRequestId: 'fetchArticleTest' })
  })

  it('should return stringified JSON', function () {
    expect(article).is.a('string')
    // article.should.be.an.instanceof(String)
    // should.doesNotThrow(() => JSON.parse(article))
  })
})
