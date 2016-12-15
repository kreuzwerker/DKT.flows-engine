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
      article = await ExtractArticle(event)
    })

    it('should have a title', function () {
      article.should.have.keys('title')
      article.title.should.be.an.instanceof(String)
    })

    it('should have a date', function () {
      article.should.have.keys('date')
      article.date.should.be.an.instanceof(String)
    })

    it('should have a text', function () {
      article.should.have.keys('text')
      article.text.should.be.an.instanceof(String)
    })
  })
})
