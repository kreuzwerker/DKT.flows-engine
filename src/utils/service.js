import _isString from 'lodash/isString'
import _isArray from 'lodash/isArray'
import Logger from './logger'
import { flowRunStepSuccessHandler } from './helpers/flowRunHelpers'
import { getStepData, testStepSuccessHandler, testStepErrorHandler } from './helpers/stepHelpers'

function getCurrentStep(stepData, input) {
  const { steps } = stepData.flowRun.flow

  // check if there is more then one step. if theres only one then it is a step test
  if (steps.length === 1) {
    return steps[0]
  }

  return stepData.flowRun.flow.steps.find((s) => {
    return parseInt(s.position, 10) === parseInt(input.currentStep, 10)
  })
}

/*
 * This function is a wrapper for service lambda function. It takes a service function as a parameter
 * and returns a function lambda function handler which can be used in flow runs and as a step test
 */
export default function service(serviceFn) {
  return async (event, context, callback) => {
    const logger = Logger(event.verbose)
    const input = _isString(event) ? JSON.parse(event) : event
    let stepData = {},
        status = 'success',
        output = {},
        inputData = {},
        result = {}

    input.currentStep += 1

    function errorHandler(err) {
      if (input.testStep) {
        testStepErrorHandler(input, inputData, stepData, err).then(errorOutput =>
          callback(null, errorOutput))
      } else {
        output = { ...input, inputData, error: err }
        callback(null, output)
      }
    }

    if (input.error) {
      errorHandler(input.error)
      return
    }

    // skip all this service if one of the previous services aborted the flow
    if (input.status === 'aborted') {
      console.log(input)
      console.log(inputData)
      output = { ...input, inputData }
      callback(null, output)
    }

    // get step data from s3
    try {
      stepData = await getStepData(input)
      inputData = stepData[input.contentKey]
    } catch (err) {
      logger.log('Error while getting step data', err)
      errorHandler(err)
      return
    }

    const currentStep = getCurrentStep(stepData, input)
    const configParams = currentStep.configParams || []
    const { userId } = stepData.flowRun.flow // owner

    // add getter to configParams
    configParams.get = (selector) => {
      const configParam = configParams.find(p => p.fieldId === selector) || {}
      return configParam.value ? configParam.value : null
    }

    try {
      // This is the service lambda execution
      const serviceResult = await serviceFn(
        inputData,
        {
          input,
          context,
          stepData,
          currentStep,
          configParams,
          userId
        },
        logger
      )
      // check if the service returns a array.
      // if the service returns a array then the service may changed the flow status to
      // another status then success or error
      if (_isArray(serviceResult)) {
        const [serviveResultData, serviceResultStatus] = serviceResult
        if (serviveResultData) {
          result = serviveResultData
        }

        if (serviceResultStatus) {
          status = serviceResultStatus
        }
        console.log('serviceResult')
        console.log(JSON.stringify(serviceResult, null, 2))
      } else {
        result = serviceResult
      }
    } catch (err) {
      logger.log('Error while service execution', err)
      errorHandler(err)
      return
    }

    // handle the service lambda output
    try {
      if (input.testStep) {
        output = await testStepSuccessHandler(input, stepData, inputData, result, status)
      } else {
        output = await flowRunStepSuccessHandler(input, stepData, inputData, result, status)
      }
    } catch (err) {
      logger.log('Error while handling service result', err)
      errorHandler(err)
      return
    }

    callback(null, output)
  }
}
