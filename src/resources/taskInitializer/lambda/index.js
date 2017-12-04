import _isString from 'lodash/isString'
import uuid from 'uuid'
import { S3, StepFunctions } from '../../../utils/aws'
import Logger from '../../../utils/logger'
import { getStepData, testStepErrorHandler } from '../../../utils/helpers/stepHelpers'
import {
  getStepOutputKey,
  getFlowRunOutputKey,
  updateLogs
} from '../../../utils/helpers/flowRunHelpers'
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
  console.log('TASK INITIALIZER')
  const s3 = S3(process.env.S3_BUCKET)
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  let stepData = [],
      activityData = {}

  input.currentStep += 1

  try {
    stepData = await getStepData(input)
  } catch (err) {
    logger.log('Error while getting step data', err)
    return testStepErrorHandler(input, stepData, err).then(errorOutput =>
      callback(null, errorOutput))
  }

  const currentStep = stepData.flowRun.flow.steps.find(step => parseInt(step.position, 10) === parseInt(input.currentStep, 10))

  try {
    activityData = await StepFunctions.getActivityTask({
      activityArn: currentStep.service.activityArn
    })
  } catch (err) {
    console.log(err)
    logger.log(
      'Unable to enhance ActivityTasks from start StateMachine: ',
      input.stateMachineArn,
      err
    )
    callback(null, { ...input, error: err })
  }

  if (input.error) {
    try {
      console.log('INPUT.ERROR', input.error)
      // await StepFunctions.sendTaskFailure({ taskToken: activityData.taskToken, cause: 'ERROR' })
      await StepFunctions.sendTaskSuccess({
        taskToken: activityData.taskToken,
        output: JSON.stringify({ ...input.error, message: 'error' })
      })
    } catch (e) {
      console.log('Unable to stop task', JSON.stringify(activityData, null, 2))
      console.log(e)
    }
    console.log('stopped task')
    callback(null, { ...input, error: input.error })
    return
  }

  const task = {
    id: uuid.v4(),
    title: getTitle(currentStep),
    description: getDescription(currentStep),
    date: new Date().toISOString(),
    type: currentStep.service.taskType || 'APPROVE',
    state: 'NOT_STARTED',
    activityArn: currentStep.service.activityArn,
    taskToken: activityData.taskToken,
    userId: stepData.flowRun.flow.userId,
    flowRun: stepData.flowRun,
    currentStep: input.currentStep,
    input: activityData.input,
    comments: []
  }

  const flowRunOutputKey = getFlowRunOutputKey(stepData.flowRun, input.runId)
  const stepOutputKey = getStepOutputKey(
    stepData.flowRun,
    input.runId,
    currentStep.id,
    input.currentStep
  )

  try {
    await createTask(task)
    const updatedStepData = {
      ...stepData,
      currentStep: input.currentStep,
      logs: updateLogs(stepData.logs, stepData[input.contentKey], currentStep, 'pending')
    }

    await Promise.all([
      s3.putObject({ Key: stepOutputKey, Body: JSON.stringify(updatedStepData, null, 2) }),
      s3.putObject({ Key: flowRunOutputKey, Body: JSON.stringify(updatedStepData, null, 2) })
    ])
  } catch (err) {
    console.log('unable to create task', task, err)
    const updatedStepData = {
      ...stepData,
      currentStep: input.currentStep,
      logs: updateLogs(
        stepData.logs,
        stepData[input.contentKey],
        currentStep,
        'error',
        'unable to create task'
      )
    }
    await Promise.all([
      s3.putObject({ Key: stepOutputKey, Body: JSON.stringify(updatedStepData, null, 2) }),
      s3.putObject({ Key: flowRunOutputKey, Body: JSON.stringify(updatedStepData, null, 2) })
    ])
    callback(null, { ...input, key: stepOutputKey, error: err })
  }

  callback(null, { ...input, key: stepOutputKey })
}

export const handler = taskInitializer
