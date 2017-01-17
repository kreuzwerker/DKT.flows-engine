import { promisifyLambda } from '../../../../lib/promisifier'
import S3 from '../../../utils/s3'
import { handler } from './index'
import event from './event.json'
import settings from '../../../../settings'


const ExtractArticle = promisifyLambda(handler)


describe('ƛ ExtractArticleTitle', async function () {
  let titleJSON

  before(async function () {
    this.timeout(settings.tests.timeout)
    titleJSON = await ExtractArticle(event, { awsRequestId: 'extractArticleTitle' })
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

    it('contains a title', function () {
      data = JSON.parse(data.Body.toString())
      expect(data).to.have.key('title')
      expect(data.title).is.a('string')
    })
  })
})
