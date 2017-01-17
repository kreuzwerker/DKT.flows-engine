import _isString from 'lodash/isString'
import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'
import settings from '../../../../settings'
import S3 from '../../../utils/s3'


const MergeJSONs = promisifyLambda(handler)
const parse = arg => (_isString(arg) ? JSON.parse(arg) : arg)


describe('ƛ MergeJSONs', function () {
  it('does runs without throwing errors', function () {
    this.timeout(settings.tests.timeout)
    expect(async () => {
      await MergeJSONs(event, { awsRequestId: 'extractArticleText' })
    }).to.not.throw(Error)
  })

  describe('returns', function () {
    let output,
        data

    before(async function () {
      this.timeout(settings.tests.timeout * 2)
      output = await MergeJSONs(event, { awsRequestId: 'extractArticleText' }).then(parse)
      data = await S3.getObject({ Key: output.Key })
    })

    it('stringified JSON', function () {
      expect(() => JSON.parse(data.Body.toString())).to.not.throw(Error)
    })

    it('merged data of all JSONs', function () {
      const json = JSON.parse(data.Body.toString())
      expect(json).to.have.keys(['title', 'date', 'text'])
      expect(json.title).is.a('string')
      expect(json.date).is.a('string')
      expect(json.text).is.a('string')
    })
  })
})
