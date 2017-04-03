import seeder from './seeder'
import { handler } from '../lambda/index'
import { promisifyLambda } from '../../../../lib/promisifier'


const StateMachineTriggerLambda = promisifyLambda(handler)

describe('ƛ StateMachineTrigger', () => {
  const testdata = seeder()
  let stateMachineArn = ''

  before(async function () {
    const res = await testdata.seed()
    stateMachineArn = res.stateMachineArn
  })

  it('triggers a Step function', async () => {
    const res = await StateMachineTriggerLambda({ stateMachineArn, verbose: false })
    expect(JSON.parse(res)).to.has.keys(['executionArn', 'startDate'])
  })

  after(async function () {
    await testdata.delete(stateMachineArn)
  })
})
