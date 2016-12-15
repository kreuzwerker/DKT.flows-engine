import 'babel-polyfill'
import should from 'should'
import { promisifyLambda } from '../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'


const FetchArticle = promisifyLambda(handler)


describe('FetchArticle ƛ handler', async function () {
  let article

  before(async function () {
    article = await FetchArticle(event)
  })

  it('should return stringified JSON', function () {
    article.should.be.an.instanceof(String)
    should.doesNotThrow(() => JSON.parse(article))
  })
})
