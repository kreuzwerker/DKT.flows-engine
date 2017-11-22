import _isString from 'lodash/isString'
import timestamp from '../../../../utils/timestamp'
import Logger from '../../../../utils/logger'
import { getFlowRunById } from '../../../dbFlowRuns/resolvers'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'

export async function handler(event, context, callback) {
  event.verbose = true
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  const url = input.configParams.find(param => param.fieldId === 'url-input').value
  const { startDatetime } = new Date(input.scheduled).getTime()
  const currentDatetime = timestamp()

  if (startDatetime > currentDatetime) {
    const msg = `startDatetime ${startDatetime} is not reached yet.`
    logger.log(msg)
    return Promise.resolve(msg)
  }

  logger.log(`Trigger FlowRun '${input.flowRun.id}' with url: ${url}`)

  try {
    const flowRun = await getFlowRunById(input.flowRun.id)
    const result = await triggerFlowRun(flowRun, url)
    logger.log('Triggered FlowRun')
    callback(null, result)
  } catch (err) {
    const result = Object.assign({}, input, { error: err })
    logger.log('Error:', err)
    callback(null, result)
  }
}
