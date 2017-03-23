import _isString from 'lodash/isString'
// import Logger from '../../../utils/logger'
import { getFlowRunData, flowRunStepSuccessHandler } from '../../../utils/helpers/flowRunHelpers'


export async function handler(event, context, callback) {
  // const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  input.currentStep += 1
  try {
    const flowRunData = await getFlowRunData(input)
    const inputData = flowRunData[input.contentKey]
    const outputData = inputData.toUpperCase()

    const output = await flowRunStepSuccessHandler(input, flowRunData, outputData)
    callback(null, output)
  } catch (err) {
    const output = Object.assign({}, input, { error: err })
    callback(null, output)
  }
}
