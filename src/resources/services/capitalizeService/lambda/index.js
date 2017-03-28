import _isString from 'lodash/isString'
// import Logger from '../../../utils/logger'
import { flowRunStepSuccessHandler } from '../../../../utils/helpers/flowRunHelpers'
import { getStepData, testStepSuccessHandler, testStepErrorHandler } from '../../../../utils/helpers/stepHelpers'


export async function handler(event, context, callback) {
  // const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  let stepData = {},
      output = {}

  input.currentStep += 1
  try {
    stepData = await getStepData(input)
    const inputData = stepData[input.contentKey]
    const outputData = inputData.toUpperCase()

    if (input.testStep) {
      output = await testStepSuccessHandler(input, stepData, outputData)
    } else {
      output = await flowRunStepSuccessHandler(input, stepData, outputData)
    }

    callback(null, output)
  } catch (err) {
    if (input.testStep) {
      testStepErrorHandler(input, stepData, err)
        .then(errorOutput => callback(null, errorOutput))
    } else {
      output = Object.assign({}, input, { error: err })
      callback(null, output)
    }
  }
}
