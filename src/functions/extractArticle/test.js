import 'babel-polyfill'
import should from 'should'
import { promisifyLambda } from '../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'


const ExtractArticle = promisifyLambda(handler)


describe('ExtractArticle ƛ handler', async function () {
  describe('extracted Article', function () {
    let article

    before(async function () {
      article = await ExtractArticle(event, { awsRequestId: 'extractArticleTest' })
    })

    it('should return stringified JSON', function () {
      article.should.be.an.instanceof(String)
      should.doesNotThrow(() => JSON.parse(article))
    })
  })
})
