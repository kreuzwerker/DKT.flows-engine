import S3 from './s3'


const flowRunBase = flowRun => `flows/${flowRun.flow.id}/flowRuns/${flowRun.id}`


function getStepOutputKey(flowRun, runId, stepIndex) {
  return `${flowRunBase(flowRun)}/steps/${stepIndex}/${runId}.json`
}


function getFlowRunOutputKey(flowRun, runId) {
  return `${flowRunBase(flowRun)}/out/${runId}.json`
}


function updateLogs(logs, currentStep, status, message = '') {
  const steps = Object.assign({}, logs.steps, {
    [currentStep]: { status, message }
  })
  return Object.assign({}, logs, { status, steps })
}


export function getFlowRunData(input) {
  const s3 = S3(process.env.S3_BUCKET)
  return s3.getObject({ Key: input.key }).then(data => JSON.parse(data.Body))
}


export function serviceSuccessHandler(input, flowRunData, serviceResult) {
  const s3 = S3(process.env.S3_BUCKET)
  const currentStep = input.currentStep + 1
  const key = getStepOutputKey(flowRunData.flowRun, input.runId, currentStep)
  const updatedFlowRunData = Object.assign({}, flowRunData, {
    [input.contentKey]: serviceResult,
    currentStep: currentStep,
    logs: updateLogs(flowRunData.logs, currentStep, 'success')
  })
  console.log(JSON.stringify({ Key: key, Body: JSON.stringify(updatedFlowRunData) }, null, 2))
  return s3.putObject({ Key: key, Body: JSON.stringify(updatedFlowRunData) })
    .then(() => Object.assign({}, input, { key, contentKey: input.contentKey }))
}


export function flowRunSuccessHandler(input, flowRunData) {
  const s3 = S3(process.env.S3_BUCKET)
  const key = getFlowRunOutputKey(flowRunData.flowRun, input.runId)
  const updatedFlowRunData = Object.assign({}, flowRunData, { status: 'done' })

  return s3.putObject({ Key: key, Body: JSON.stringify(updatedFlowRunData) })
    .then(() => Object.assign({}, input, { key, contentKey: input.contentKey }))
}


export function errorHandler(err, input, errorKey = 'error') {
  const s3 = S3(process.env.S3_BUCKET)
  const currentStep = input.currentStep + 1
  const update = currentData => Object.assign({}, currentData, {
    status: 'error',
    currentStep: currentStep,
    logs: updateLogs(currentData.logs, currentStep, 'error', err)
  })

  return getFlowRunData(input)
    .then(flowRunData => update(flowRunData))
    .then(updatedData => s3.putObject({
      Key: getFlowRunOutputKey(updatedData.flowRun, input.runId),
      Body: JSON.stringify(updatedData)
    }).then(() => updatedData))
    .then(({ key }) => Object.assign({}, input, { key, contentKey: errorKey }))
}
