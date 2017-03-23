import S3 from '../s3'
import dynDB from '../dynamoDB'
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
 * ---- Payload generators -----------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createTestStepDataParams(stepId, runId, payload) {
  return {
    Key: getTestStepInputKey(stepId, runId),
    Body: JSON.stringify({
      startedAt: timestamp(),
      data: payload,
      logs: { },
      runId
    }, null, 2)
  }
}

export function createTestStepTriggerParams(stepId, serviceArn, runId) {
  return {
    ClientContext: 'TestStep',
    FunctionName: serviceArn,
    InvocationType: 'Event',
    LogType: 'Tail',
    Payload: JSON.stringify({
      runId: runId,
      key: getTestStepInputKey(stepId, runId),
      contentType: 'json',
      contentKey: 'data'
    })
  }
}
