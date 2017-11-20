import _isString from 'lodash/isString'
import uuid from 'uuid'
import Logger from '../../../utils/logger'
import StepFunctions from '../../../utils/stepFunctions'
import { getStepData, testStepErrorHandler } from '../../../utils/helpers/stepHelpers'
import { createTask } from '../../dbTasks/resolvers'

function getTitle(currentStep) {
  if (
    currentStep.configParams &&
    currentStep.configParams[0] &&
    currentStep.configParams[0].value
  ) {
    return currentStep.configParams[0].value
  }
  return currentStep.service.name
}

function getDescription(currentStep) {
  if (
    currentStep.configParams &&
    currentStep.configParams[1] &&
    currentStep.configParams[1].value
  ) {
    return currentStep.configParams[1].value
  }
  return currentStep.description
}

async function taskInitializer(event, context, callback) {
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  let stepData = [],
      activityData = {}

  try {
    stepData = await getStepData(input)
  } catch (err) {
    logger.log('Error while getting step data', err)
    return testStepErrorHandler(input, stepData, err).then(errorOutput =>
      callback(null, errorOutput)
    )
  }

  const currentStep = stepData.flowRun.flow.steps.find(
    step => step.position === stepData.currentStep + 1
  )

  try {
    activityData = await StepFunctions.getActivityTask({
      activityArn: currentStep.service.activityArn
    })
  } catch (err) {
    logger.log(
      'Unable to enhance ActivityTasks from start StateMachine: ',
      input.stateMachineArn,
      err
    )
    callback(null, { ...input, error: err })
  }

  const task = {
    id: uuid.v4(),
    title: getTitle(currentStep),
    description: getDescription(currentStep),
    date: new Date().toISOString(),
    type: 'APPROVE',
    state: 'NOT_STARTED',
    activityArn: currentStep.service.activityArn,
    taskToken: activityData.taskToken,
    flow: stepData.flowRun, // legacy
    flowRun: stepData.flowRun,
    currentStep: input.currentStep,
    input: JSON.stringify(activityData.input),
    comments: []
  }

  try {
    await createTask(task)
  } catch (err) {
    logger.log('unable to create task', task, err)
    callback(null, { ...input, error: err })
  }

  callback(null, input)
}

export const handler = taskInitializer
