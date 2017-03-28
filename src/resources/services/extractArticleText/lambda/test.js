import { promisifyLambda } from '..././../../../lib/promisifier'
import S3 from '../../../../utils/s3'
import { handler } from './index'
import event from './event.json'
import settings from '../../../../../settings'


process.env.S3_BUCKET = 'dkt.flow-engine.test'
const ExtractArticle = promisifyLambda(handler)


describe('ƛ ExtractArticleText', async function () {
  let titleJSON

  before(async function () {
    this.timeout(settings.tests.timeout)
    titleJSON = await ExtractArticle(event, { awsRequestId: 'extractArticleText' })
  })

  it('returns a stringified JSON', function () {
    expect(titleJSON).is.a('string')
    expect(() => JSON.parse(titleJSON)).to.not.throw(Error)
  })

  describe('extracted JSON', function () {
    let data

    before(async function () {
      const { Key } = JSON.parse(titleJSON)
      const s3 = S3('dkt.flow-engine.test')
      data = await s3.getObject({ Key })
    })

    it('contains a text', function () {
      data = JSON.parse(data.Body.toString())
      expect(data).to.have.key('text')
      expect(data.text).is.a('string')
    })
  })
})
