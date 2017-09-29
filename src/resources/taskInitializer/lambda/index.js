import _isString from 'lodash/isString'
import uuid from 'uuid'
import Logger from '../../../utils/logger'
import StepFunctions from '../../../utils/stepFunctions'
import { getStepData, testStepErrorHandler } from '../../../utils/helpers/stepHelpers'
import { createTask } from '../../dbTasks/resolvers'

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

  const currentStep = stepData.flowRun.flow.steps[stepData.currentStep]

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

  // TODO SAVE REQUIRED TASK DATA AND UPDATE GRAPHQL

  const task = {
    id: uuid.v4(),
    title: currentStep.service.name,
    description: currentStep.description,
    date: new Date().toISOString(),
    type: 'APPROVE',
    state: 'NOT_STARTED',
    taskToken: activityData.taskToken,
    flow: stepData.flowRun,
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
