/*
 * Utitlity Module so simplify FS actions
 */

const Fs = require('fs')
const Path = require('path')
const _flattenDeep = require('lodash/flattenDeep')
const settings = require('../settings.js')


function fsUtil() {
  const { workflows, functions, dist } = settings.fs


  const fromDir = (base, filter) => {
    if (!Fs.existsSync(base)) {
      console.log('no directory', base)
      return null
    }
    const found = []
    const files = Fs.readdirSync(base)

    for (let i = 0; i < files.length; i++) {
      const filename = Path.join(base, files[i])
      const stat = Fs.lstatSync(filename)
      if (stat.isDirectory()) {
        found.push(fromDir(filename, filter))
      } else if (filename.indexOf(filter) >= 0) {
        found.push(filename)
      }
    }

    return _flattenDeep(found)
  }


  const getAllFunctions = () => {
    const lambdaFunctions = Fs.readdirSync(functions.base)
    return lambdaFunctions.filter(file => file.indexOf('.') === -1) // only visible directories
  }

  const getAllFunctionsZips = (zipFileBase = dist.base) => {
    const lambdaFunctions = Fs.readdirSync(zipFileBase)
    return lambdaFunctions.filter(file => file.indexOf('.zip') === -1) // only visible directories
                          .map(file => file.split('.')[0])
  }

  const getFunctionPath = (functionName) => {
    return Path.join(settings.fs.functions.base, functionName, functions.handler)
  }

  const functionExists = (functionName) => {
    return Fs.existsSync(getFunctionPath(functionName))
  }


  const getAllWorkflows = () => {
    const workflowsFiles = Fs.readdirSync(workflows.base)
    return workflowsFiles.filter(file => file.indexOf('.json') !== -1)
  }

  const getWorkflowPath = (workflowName) => {
    let workflow = workflowName

    if (workflow.indexOf('.json') !== -1) {
      workflow = workflow.split('.')[0]
    }

    return Path.join(workflows.base, `${workflow}.json`)
  }

  const getWorkflowArnPath = (workflowName) => {
    return Path.join(workflows.base, `${workflowName}.arn`)
  }

  const workflowExists = (workflow) => {
    return Fs.existsSync(getWorkflowPath(workflow))
  }


  return {
    fromDir,
    getAllFunctions, getAllFunctionsZips, getFunctionPath, functionExists,
    getAllWorkflows, getWorkflowPath, getWorkflowArnPath, workflowExists
  }
}


module.exports = fsUtil()
