import S3 from './s3'
import dynDB from './dynamoDB'
import timestamp from './timestamp'


/*
 * ---- Path helpers -----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
function getFlowRunBase(flowRun) {
  return `flows/${flowRun.flow.id}/flowRuns/${flowRun.id}`
}

export function getFlowRunInputKey(flowRun, runId) {
  return `${getFlowRunBase(flowRun)}/in/${runId}.json`
}

export function getStepOutputKey(flowRun, runId, stepId, position) {
  return `${getFlowRunBase(flowRun)}/steps/${position}_${stepId}/${runId}.json`
}

export function getFlowRunOutputKey(flowRun, runId) {
  return `${getFlowRunBase(flowRun)}/out/${runId}.json`
}


/*
 * ---- Payload generators -----------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createFlowRunDataParams(flowRun, runId, payload, status = 'running') {
  return {
    Key: getFlowRunInputKey(flowRun, runId),
    Body: JSON.stringify({
      flowRun: flowRun,
      startedAt: timestamp(),
      currentStep: 0,
      data: payload,
      logs: { },
      status, runId
    })
  }
}

export function createFlowRunTriggerParams(flowRun, runId) {
  return {
    ClientContext: 'ManualTrigger',
    FunctionName: process.env.STATE_MACHINE_TRIGGER_FUNCTION,
    InvocationType: 'Event',
    LogType: 'Tail',
    Payload: JSON.stringify({
      runId: runId,
      key: getFlowRunInputKey(flowRun, runId),
      stateMachineArn: flowRun.stateMachineArn,
      currentStep: 0,
      contentType: 'json',
      contentKey: 'data'
    })
  }
}


/*
 * ---- Data Fetcher -----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function getFlowRunData(input) {
  const s3 = S3(process.env.S3_BUCKET)
  return s3.getObject({ Key: input.key }).then(data => JSON.parse(data.Body))
}


/*
 * ---- Success / Error Handler ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
function getStepData(flowRun, currentStep) {
  const steps = flowRun.flow.steps || []
  return steps.filter(s => (s.position === currentStep))[0]
}

function updateLogs(logs, step, status, message = '') {
  const steps = Object.assign({}, logs.steps, {
    [step.id]: {
      status,
      message,
      position: step.position,
      finishedAt: timestamp()
    }
  })
  return Object.assign({}, logs, { status, steps })
}

function updateFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: { S: flowRun.id } }
  }

  return dynDB.updateItem(table, query, flowRun)
}


/*
 * ---- Success Handler --------------------------------------------------------
 */
export function serviceSuccessHandler(input, flowRunData, serviceResult) {
  const s3 = S3(process.env.S3_BUCKET)
  const position = input.currentStep
  const step = getStepData(flowRunData.flowRun, position)
  const stepOutputKey = getStepOutputKey(flowRunData.flowRun, input.runId, step.id, position)
  const flowRunOutputKey = getFlowRunOutputKey(flowRunData.flowRun, input.runId)

  const updatedFlowRunData = Object.assign({}, flowRunData, {
    [input.contentKey]: serviceResult,
    currentStep: position,
    logs: updateLogs(flowRunData.logs, step, 'success')
  })

  return Promise.all([
    s3.putObject({ Key: stepOutputKey, Body: JSON.stringify(updatedFlowRunData, null, 2) }),
    s3.putObject({ Key: flowRunOutputKey, Body: JSON.stringify(updatedFlowRunData, null, 2) })
  ]).then(() => Object.assign({}, input, { key: stepOutputKey, contentKey: input.contentKey }))
}

export function flowRunSuccessHandler(input, flowRunData) {
  const s3 = S3(process.env.S3_BUCKET)
  const key = getFlowRunOutputKey(flowRunData.flowRun, input.runId)

  flowRunData.flowRun.status = 'success'
  flowRunData.status = 'success'
  flowRunData.finishedAt = timestamp()

  return s3.putObject({ Key: key, Body: JSON.stringify(flowRunData, null, 2) })
    .then(() => updateFlowRun({
      id: flowRunData.flowRun.id,
      status: 'success',
      message: flowRunData.flowRun.message
    }))
    .then(() => Object.assign({}, input, { key, contentKey: input.contentKey }))
}


/*
 * ---- Error Handler ----------------------------------------------------------
 */
export function errorHandler(err, input, errorKey = 'error') {
  const s3 = S3(process.env.S3_BUCKET)
  const position = input.currentStep
  const update = (currentData) => {
    const step = getStepData(currentData.flowRun, position)
    return Object.assign({}, position, {
      status: 'error',
      currentStep: position,
      logs: updateLogs(currentData.logs, step, 'error', err)
    })
  }

  return getFlowRunData(input)
    .then((flowRunData) => {
      return updateFlowRun({
        id: flowRunData.flowRun.id,
        status: 'error',
        finishedAt: timestamp(),
        message: flowRunData.flowRun.message
      })
      .then(() => update(flowRunData))
    })
    .then((updatedData) => {
      return s3.putObject({
        Key: getFlowRunOutputKey(updatedData.flowRun, input.runId),
        Body: JSON.stringify(updatedData, null, 2)
      }).then(() => updatedData)
    })
    .then(({ key }) => Object.assign({}, input, { key, contentKey: errorKey }))
}
