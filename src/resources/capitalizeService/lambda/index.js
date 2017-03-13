import _isString from 'lodash/isString'
// import Logger from '../../../utils/logger'
import { getFlowRunData, serviceSuccessHandler } from '../../../utils/flowRunHelpers'


export async function handler(event, context, callback) {
  // const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  input.currentStep += 1
  try {
    const flowRunData = await getFlowRunData(input)
    const inputData = flowRunData[input.contentKey]
    const outputData = inputData.toUpperCase()

    const result = await serviceSuccessHandler(input, flowRunData, outputData)
    callback(null, result)
  } catch (err) {
    const result = { input, error: 'something went wrong' }
    callback(null, result)
  }
}
