import { promisifyLambda } from '../../../../lib/promisifier'
import { handler } from './index'
import event from './event.json'
import settings from '../../../../settings'


const StartWorkflowExecution = promisifyLambda(handler)


describe('ƛ StartWorkflowExecution', async function () {
  it(`starts the workflow ${event.workflow}`, function () {
    this.timeout(settings.tests.timout)
    expect(async () => {
      await StartWorkflowExecution(event, { awsRequestId: 'startWorkflowExecutionTest' })
    }).to.not.throw('good function')
  })


  describe('result', function () {
    let result

    before(async function () {
      this.timeout(settings.tests.timout)
      result = await StartWorkflowExecution(event, { awsRequestId: 'startWorkflowExecutionTest' })
    })

    it('is a stringified JSON', function () {
      expect(() => JSON.parse(result)).to.not.throw(Error)
    })

    it('contains executionArn', function () {
      const data = JSON.parse(result)
      expect(data).to.have.any.keys('executionArn')
      expect(data.executionArn).is.a('string')
    })

    it('contains startDate', function () {
      const data = JSON.parse(result)
      expect(data).to.have.any.keys('startDate')
      expect(() => new Date(data.startDate)).to.not.throw(Error)
    })
  })
})
