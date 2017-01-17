/*
 * Utitlity Module so simplify FS actions
 */

const Fs = require('fs')
const Path = require('path')
const _flattenDeep = require('lodash/flattenDeep')
const settings = require('../settings.js')

const { workflows, lambdas, resources } = settings.fs

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
   * ---- resources -------------------------------------------------------------
   */
  function getResourceTemplatePath(resourceName) {
    return Path.join(settings.fs.resources.base, resourceName, 'template')
  }

  function getAllResources() {
    const serviceFns = Fs.readdirSync(resources.base)
    return serviceFns.filter(file => file.indexOf('.') === -1) // only visible directories
  }

  function getLambdaPath(resourceName) {
    return Path.join(settings.fs.resources.base, resourceName, 'lambda', lambdas.handler)
  }

  function lambdaExists(resourceName) {
    return Fs.existsSync(getLambdaPath(resourceName))
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
    getResourceTemplatePath, getAllResources,
    getLambdaPath, lambdaExists,
    getAllWorkflows, getWorkflowPath, getWorkflowArnPath, workflowExists
  }
}


module.exports = fsUtil()
