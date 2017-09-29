import _isString from 'lodash/isString'
import StepFunctions from './stepFunctions'

export default function taskWorker(wokerFn) {
  return async (inputData, logger, { event, context, stepData }) => {
    const { steps } = stepData.flowRun.flow
    const { currentStep } = stepData.flowRun
    const task = steps.filter(step => parseInt(step.position, 10) === parseInt(currentStep, 10))

    logger.log('*** taskWorker')
    logger.log(task)
    logger.log('**************')

    try {
      // This is the service lambda execution
      const workerResult = await wokerFn(inputData, logger, { event, context, stepData })
      return workerResult
    } catch (err) {
      logger.log('Error while taskWorker execution', err)
      return Promise.reject(err)
    }
  }
}
