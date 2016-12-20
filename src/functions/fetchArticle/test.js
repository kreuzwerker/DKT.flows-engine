import { promisifyLambda } from '../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'


const FetchArticle = promisifyLambda(handler)


describe('FetchArticle ƛ handler', async function () {
  let article

  before(async function () {
    article = await FetchArticle(event, { awsRequestId: 'fetchArticleTest' })
  })

  it('should return stringified JSON', function () {
    expect(article).is.a('string')
    // article.should.be.an.instanceof(String)
    // should.doesNotThrow(() => JSON.parse(article))
  })
})
