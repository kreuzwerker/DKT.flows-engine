import { unmarshalItem } from 'dynamodb-marshaler'
import S3 from './s3'
import dynDB from './dynamoDB'


const flowRunBase = flowRun => `flows/${flowRun.flow.id}/flowRuns/${flowRun.id}`


function getStepOutputKey(flowRun, runId, stepId) {
  return `${flowRunBase(flowRun)}/steps/${stepId}/${runId}.json`
}


function getFlowRunOutputKey(flowRun, runId) {
  return `${flowRunBase(flowRun)}/out/${runId}.json`
}


function getStepData(flowRun, currentStep) {
  const steps = flowRun.flow.steps || []
  return steps.filter(s => (s.position === currentStep))[0]
}


function updateLogs(logs, step, status, message = '') {
  const steps = Object.assign({}, logs.steps, {
    [step.id]: {
      status,
      message,
      position: step.position
    }
  })
  return Object.assign({}, logs, { status, steps })
}


function getFlowRunById(flowId) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: { S: flowId } }
  }

  return dynDB.getItem(table, query)
              .then(r => (r.Item ? unmarshalItem(r.Item) : null))
}


function updateFlowRun(flowRun) {
  const table = process.env.DYNAMO_FLOW_RUNS
  const query = {
    Key: { id: { S: flowRun.id } }
  }

  return dynDB.updateItem(table, query, flowRun)
}


export function getFlowRunData(input) {
  const s3 = S3(process.env.S3_BUCKET)
  return s3.getObject({ Key: input.key }).then(data => JSON.parse(data.Body))
}


export function serviceSuccessHandler(input, flowRunData, serviceResult) {
  const s3 = S3(process.env.S3_BUCKET)
  const position = input.currentStep
  const step = getStepData(flowRunData.flowRun, position)
  const key = getStepOutputKey(flowRunData.flowRun, input.runId, step.id)

  const updatedFlowRunData = Object.assign({}, flowRunData, {
    [input.contentKey]: serviceResult,
    currentStep: position,
    logs: updateLogs(flowRunData.logs, step, 'success')
  })

  return s3.putObject({ Key: key, Body: JSON.stringify(updatedFlowRunData, null, 2) })
    .then(() => Object.assign({}, input, { key, contentKey: input.contentKey }))
}


export function flowRunSuccessHandler(input, flowRunData) {
  const s3 = S3(process.env.S3_BUCKET)
  const key = getFlowRunOutputKey(flowRunData.flowRun, input.runId)

  flowRunData.flowRun.status = 'success'
  flowRunData.status = 'success'

  return s3.putObject({ Key: key, Body: JSON.stringify(flowRunData, null, 2) })
    .then(() => updateFlowRun({
      id: flowRunData.flowRun.id,
      status: 'success',
      message: flowRunData.flowRun.message
    }))
    .then(() => Object.assign({}, input, { key, contentKey: input.contentKey }))
}


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
