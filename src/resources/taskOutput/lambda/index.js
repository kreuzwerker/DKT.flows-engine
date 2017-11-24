import _isString from 'lodash/isString'
import { S3 } from '../../../utils/aws'
import Logger from '../../../utils/logger'
import { getStepData } from '../../../utils/helpers/stepHelpers'
import { getFlowRunOutputKey, updateLogs } from '../../../utils/helpers/flowRunHelpers'

export async function handler(event, context, callback) {
  const s3 = S3(process.env.S3_BUCKET)
  const logger = Logger()
  const inputEvent = _isString(event) ? JSON.parse(event) : event
  const taskOutput = inputEvent[0].message
  const input = inputEvent[1]

  let stepData = [],
      updatedStepData = {}

  try {
    stepData = await getStepData(input)
  } catch (err) {
    logger.log('Error while getting step data', err)
    callback(null, { ...input, error: err })
  }

  const currentStep = stepData.flowRun.flow.steps.find(step => parseInt(step.position, 10) === parseInt(input.currentStep, 10))

  const flowRunOutputKey = getFlowRunOutputKey(stepData.flowRun, input.runId)

  if (input.error) {
    updatedStepData = {
      ...stepData,
      status: 'error',
      logs: updateLogs(stepData.logs, currentStep, 'error', input.error.message)
    }
  } else {
    updatedStepData = {
      ...stepData,
      status: taskOutput,
      logs: updateLogs(stepData.logs, currentStep, taskOutput)
    }
  }

  try {
    await Promise.all([
      s3.putObject({ Key: input.key, Body: JSON.stringify(updatedStepData, null, 2) }),
      s3.putObject({ Key: flowRunOutputKey, Body: JSON.stringify(updatedStepData, null, 2) })
    ])
    callback(null, input)
  } catch (err) {
    console.log(err)
    callback(null, { ...input, error: err })
  }
}
