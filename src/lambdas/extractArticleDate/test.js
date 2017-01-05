import { promisifyLambda } from '../../../lib/promisifier'
import S3 from '../../utils/s3'
import { handler } from './index'
import event from './event.json'


const ExtractArticle = promisifyLambda(handler)


describe('ƛ ExtractArticleDate', async function () {
  let titleJSON

  before(async function () {
    titleJSON = await ExtractArticle(event, { awsRequestId: 'extractArticleDate' })
  })

  it('returns a stringified JSON', function () {
    expect(titleJSON).is.a('string')
    expect(() => JSON.parse(titleJSON)).to.not.throw(Error)
  })

  describe('extracted JSON', function () {
    let data

    before(async function () {
      const { Key } = JSON.parse(titleJSON)
      data = await S3.getObject({ Key })
    })

    it('contains a date', function () {
      data = JSON.parse(data.Body.toString())
      expect(data).to.have.key('date')
      expect(data.date).is.a('string')
    })
  })
})
