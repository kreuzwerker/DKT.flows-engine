/*
 * Utitlity Module so simplify FS actions
 */

const Fs = require('fs')
const Path = require('path')
const settings = require('../settings.js')


const fsUtil = () => {
  function getAllFunctions() {
    const functions = Fs.readdirSync(settings.fs.functions.base)
    return functions.filter(func => func.indexOf('.js') === -1)
  }

  function getFunctionPath(functionName) {
    return Path.join(settings.fs.functions.base, functionName, settings.fs.functions.handler)
  }

  function functionExists(functionName) {
    return Fs.existsSync(getFunctionPath(functionName))
  }


  function getAllWorkflows() {
    // TODO
  }

  function getWorkflowPath(workflowName) {
    return Path.join(settings.fs.workflows.base, `${workflowName}.json`)
  }

  function getWorkflowArnPath(workflowName) {
    return Path.join(settings.fs.workflows.base, `${workflowName}.arn`)
  }

  function workflowExists(workflow) {
    return Fs.existsSync(getWorkflowPath(workflow))
  }


  return {
    getAllFunctions, getFunctionPath, functionExists,
    getAllWorkflows, getWorkflowPath, getWorkflowArnPath, workflowExists
  }
}


module.exports = fsUtil()
