/*
 * Utitlity Module so simplify FS actions
 */

const Fs = require('fs')
const Path = require('path')
const _flattenDeep = require('lodash/flattenDeep')
const settings = require('../settings.js')

const { workflows, lambdas, dist } = settings.fs

function fsUtil() {
  /*
   * ---- general --------------------------------------------------------------
   */
  function fromDir(base, filter) {
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


  /*
   * ---- lambdas --------------------------------------------------------------
   */
  function getAllLambdas() {
    const lambdaFunctions = Fs.readdirSync(lambdas.base)
    return lambdaFunctions.filter(file => file.indexOf('.') === -1) // only visible directories
  }

  function getAllLambdaZips(zipFileBase = dist.base) {
    const lambdaFunctions = Fs.readdirSync(zipFileBase)
    return lambdaFunctions.filter(file => file.indexOf('.zip') === -1) // only visible directories
                          .map(file => file.split('.')[0])
  }

  function getLambdaPath(functionName) {
    return Path.join(settings.fs.lambdas.base, functionName, lambdas.handler)
  }

  function lambdaExists(functionName) {
    return Fs.existsSync(getLambdaPath(functionName))
  }


  /*
   * ---- workflows ------------------------------------------------------------
   */
  function getAllWorkflows() {
    const workflowsFiles = Fs.readdirSync(workflows.base)
    return workflowsFiles.filter(file => file.indexOf('.json') !== -1)
  }

  function getWorkflowPath(workflowName) {
    let workflow = workflowName

    if (workflow.indexOf('.json') !== -1) {
      workflow = workflow.split('.')[0]
    }

    return Path.join(workflows.base, `${workflow}.json`)
  }

  function getWorkflowArnPath(workflowName) {
    return Path.join(workflows.base, `${workflowName}.arn`)
  }

  function workflowExists(workflow) {
    return Fs.existsSync(getWorkflowPath(workflow))
  }


  /*
   * ---- public ---------------------------------------------------------------
   */
  return {
    fromDir,
    getAllLambdas, getAllLambdaZips, getLambdaPath, lambdaExists,
    getAllWorkflows, getWorkflowPath, getWorkflowArnPath, workflowExists
  }
}


module.exports = fsUtil()
