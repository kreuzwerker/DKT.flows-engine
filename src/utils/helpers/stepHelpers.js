import { S3 } from '../aws'
import timestamp from '../timestamp'

/*
 * ---- Path helpers -----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
function getTestStepBase(stepId) {
  return `steps/${stepId}`
}

export function getTestStepInputKey(stepId, runId) {
  return `${getTestStepBase(stepId)}/in/${runId}.json`
}

export function getTestStepOutputKey(stepId, runId) {
  return `${getTestStepBase(stepId)}/out/${runId}.json`
}

/*
 * ---- Data Fetcher -----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function getStepData(input) {
  const s3 = S3(process.env.S3_BUCKET)
  return s3.getObject({ Key: input.key }).then(data => JSON.parse(data.Body))
}

/*
 * ---- Payload generators -----------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createTestStepDataParams(step, runId, payload) {
  return {
    Key: getTestStepInputKey(step.id, runId),
    Body: JSON.stringify(
      {
        startedAt: timestamp(),
        data: payload,
        logs: {},
        stepId: step.id,
        flowRun: {
          flow: {
            steps: [step]
          }
        },
        runId
      },
      null,
      2
    )
  }
}

export function createTestStepTriggerParams(stepId, serviceArn, runId) {
  return {
    // ClientContext: JSON.stringify({ testStep: true }),
    FunctionName: serviceArn,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({
      runId: runId,
      key: getTestStepInputKey(stepId, runId),
      contentType: 'json',
      contentKey: 'data',
      testStep: true
    })
  }
}

/*
 * ---- Success / Error Handler ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
function updateLogs(logs, inputData, stepData, status, message = '') {
  const steps = Object.assign({}, logs.steps, {
    [stepData.stepId]: {
      status,
      message,
      inputData,
      finishedAt: timestamp()
    }
  })
  return Object.assign({}, logs, { status, steps })
}

/*
 * ---- Success Handler --------------------------------------------------------
 */
export function testStepSuccessHandler(input, stepData, inputData, result, status) {
  const s3 = S3(process.env.S3_BUCKET)
  const key = getTestStepOutputKey(stepData.stepId, stepData.runId)

  stepData.status = 'success'
  stepData.finishedAt = timestamp()
  stepData[input.contentKey] = result
  stepData.logs = updateLogs(stepData.logs, inputData, stepData, 'success')

  return s3.putObject({ Key: key, Body: JSON.stringify(stepData, null, 2) }).then(() => ({
    ...input,
    status,
    key,
    contentKey: input.contentKey
  }))
}

/*
 * ---- Error Handler ----------------------------------------------------------
 */
export function testStepErrorHandler(input, inputData, stepData, error) {
  const s3 = S3(process.env.S3_BUCKET)
  const key = getTestStepOutputKey(stepData.stepId, stepData.runId)

  stepData.status = 'error'
  stepData.finishedAt = timestamp()
  stepData.error = error.message
  stepData.logs = updateLogs(stepData.logs, inputData, stepData, 'error')

  return s3
    .putObject({ Key: key, Body: JSON.stringify(stepData, null, 2) })
    .then(() => Object.assign({}, input, { key, contentKey: 'error' }))
}
