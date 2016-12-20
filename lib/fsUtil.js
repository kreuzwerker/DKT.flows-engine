/*
 * Utitlity Module so simplify FS actions
 */

const Fs = require('fs')
const Path = require('path')
const settings = require('../settings.js')


function fsUtil() {
  const { workflows, functions } = settings.fs

  const getAllFunctions = () => {
    const lambdaFunctions = Fs.readdirSync(functions.base)
    return lambdaFunctions.filter(file => file.indexOf('.') === -1) // only visible directories
  }

  const getFunctionPath = (functionName) => {
    return Path.join(settings.fs.functions.base, functionName, functions.handler)
  }

  const functionExists = (functionName) => {
    return Fs.existsSync(getFunctionPath(functionName))
  }


  const getAllWorkflows = () => {
    // TODO
  }

  const getWorkflowPath = (workflowName) => {
    return Path.join(workflows.base, `${workflowName}.json`)
  }

  const getWorkflowArnPath = (workflowName) => {
    return Path.join(workflows.base, `${workflowName}.arn`)
  }

  const workflowExists = (workflow) => {
    return Fs.existsSync(getWorkflowPath(workflow))
  }


  return {
    getAllFunctions, getFunctionPath, functionExists,
    getAllWorkflows, getWorkflowPath, getWorkflowArnPath, workflowExists
  }
}


module.exports = fsUtil()
