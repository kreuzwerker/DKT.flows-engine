import _isString from 'lodash/isString'
import Logger from './logger'
import { flowRunStepSuccessHandler } from './helpers/flowRunHelpers'
import { getStepData, testStepSuccessHandler, testStepErrorHandler } from './helpers/stepHelpers'

export default function service(serviceFn) {
  return async (event, context, callback) => {
    const logger = Logger(event.verbose)
    const input = _isString(event) ? JSON.parse(event) : event
    let stepData = {},
        output = {},
        inputData = {},
        serviceResult = {}

    input.currentStep += 1

    function errorHandler(err) {
      if (input.testStep) {
        testStepErrorHandler(input, stepData, err).then(errorOutput => callback(null, errorOutput))
      } else {
        output = Object.assign({}, input, { error: err })
        callback(null, output)
      }
    }

    // get step data from s3
    try {
      stepData = await getStepData(input)
      inputData = stepData[input.contentKey]
    } catch (err) {
      logger.log('Error while getting step data', err)
      errorHandler(err)
    }

    try {
      // This is the service lambda execution
      serviceResult = await serviceFn(inputData, logger, { event, context })
    } catch (err) {
      logger.log('Error while service execution', err)
      errorHandler(err)
    }

    // handle the service lambda output
    try {
      if (input.testStep) {
        output = await testStepSuccessHandler(input, stepData, serviceResult)
      } else {
        output = await flowRunStepSuccessHandler(input, stepData, serviceResult)
      }
    } catch (err) {
      logger.log('Error while handling service result', err)
      errorHandler(err)
    }

    callback(null, output)
  }
}
