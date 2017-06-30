import uuid from 'uuid'
import S3 from '../s3'
import Lambda from '../lambda'
import timestamp from '../timestamp'
import { getStepData } from './stepHelpers'
import * as dbFlowRun from '../../resources/dbFlowRuns/resolvers'

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
    Body: JSON.stringify(
      {
        flowRun: flowRun,
        startedAt: timestamp(),
        currentStep: 0,
        data: payload,
        logs: {},
        status,
        runId
      },
      null,
      2
    )
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

export function triggerFlowRun(flowRun, payload) {
  const s3 = S3(process.env.S3_BUCKET)

  const runId = `${timestamp()}_${uuid.v4()}`

  if (!flowRun.runs) {
    flowRun.runs = []
  }

  flowRun.runs.push(runId)

  const flowRunData = createFlowRunDataParams(flowRun, runId, payload, 'running')
  const invokeParams = createFlowRunTriggerParams(flowRun, runId)

  return s3.putObject(flowRunData).then(() => Lambda.invoke(invokeParams)).then(() =>
    dbFlowRun.updateFlowRun({
      id: flowRun.id,
      status: 'running',
      message: null,
      runs: flowRun.runs,
      runsCount: flowRun.runs.length
    })
  )
}

/*
 * ---- Success / Error Handler ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
function getStepFromFlowRun(flowRun, currentStep) {
  const steps = flowRun.flow.steps || []
  return steps.filter(s => s.position === currentStep)[0]
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

/*
 * ---- Success Handler --------------------------------------------------------
 */
export async function flowRunStepSuccessHandler(input, flowRunData, serviceResult) {
  const s3 = S3(process.env.S3_BUCKET)
  const position = input.currentStep
  const step = getStepFromFlowRun(flowRunData.flowRun, position)
  const stepOutputKey = getStepOutputKey(flowRunData.flowRun, input.runId, step.id, position)
  const flowRunOutputKey = getFlowRunOutputKey(flowRunData.flowRun, input.runId)

  const updatedFlowRunData = Object.assign({}, flowRunData, {
    [input.contentKey]: serviceResult,
    currentStep: position,
    logs: updateLogs(flowRunData.logs, step, 'success')
  })

  try {
    await Promise.all([
      s3.putObject({ Key: stepOutputKey, Body: JSON.stringify(updatedFlowRunData, null, 2) }),
      s3.putObject({ Key: flowRunOutputKey, Body: JSON.stringify(updatedFlowRunData, null, 2) })
    ])

    return Object.assign({}, input, { key: stepOutputKey, contentKey: input.contentKey })
  } catch (err) {
    console.log(err)
    return err
  }
}

export async function flowRunSuccessHandler(input, flowRunData) {
  const s3 = S3(process.env.S3_BUCKET)
  const key = getFlowRunOutputKey(flowRunData.flowRun, input.runId)

  flowRunData.flowRun.status = 'success'
  flowRunData.status = 'success'
  flowRunData.finishedAt = timestamp()

  try {
    await s3.putObject({ Key: key, Body: JSON.stringify(flowRunData, null, 2) })
    await dbFlowRun.updateFlowRun({
      id: flowRunData.flowRun.id,
      status: 'success',
      message: flowRunData.flowRun.message
    })

    return Object.assign({}, input, { key, contentKey: input.contentKey })
  } catch (err) {
    console.log(err)
    return err
  }
}

/*
 * ---- Error Handler ----------------------------------------------------------
 */
export async function flowRunErrorHandler(err, input) {
  const s3 = S3(process.env.S3_BUCKET)
  const position = input.currentStep
  const update = (currentData) => {
    const step = getStepFromFlowRun(currentData.flowRun, position)
    const updatedData = Object.assign({}, position, {
      status: 'error',
      currentStep: position,
      logs: updateLogs(currentData.logs, step, 'error', err.message)
    })
    return s3.putObject({
      Key: getFlowRunOutputKey(updatedData.flowRun, input.runId),
      Body: JSON.stringify(updatedData, null, 2)
    })
  }

  try {
    const flowRunData = await getStepData(input)
    const [_, updatedData] = await Promise.all([
      dbFlowRun.updateFlowRun({
        id: flowRunData.flowRun.id,
        status: 'error',
        finishedAt: timestamp(),
        message: flowRunData.flowRun.message
      }),
      update(flowRunData)
    ])

    return updatedData
  } catch (error) {
    console.log(error)
    return error
  }
}
