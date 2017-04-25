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
  function resourcePath(resourceName) {
    const resource = Path.join(settings.fs.resources.base, resourceName)
    const serviceResource = Path.join(settings.fs.resources.base, 'services', resourceName)

    if (Fs.existsSync(serviceResource)) {
      return serviceResource
    }

    return resource
  }

  function getResourceTemplatePath(resourceName) {
    return Path.join(resourcePath(resourceName), 'template')
  }

  function getResourceSwaggerPath(resourceName) {
    return Path.join(resourcePath(resourceName), 'api', 'swagger')
  }

  function getAllResources() {
    const visibleFilter = file => file.indexOf('.') === -1
    const resourceFns = Fs.readdirSync(resources.base).filter(visibleFilter)
    const servicesFns = Fs.readdirSync(resources.services.base).filter(visibleFilter)

    return resourceFns.concat(servicesFns.map(fn => Path.join('services', fn)))
  }

  function getAllResourcesWithLambda() {
    const allResources = getAllResources()

    return allResources.filter((resource) => {
      return Fs.existsSync(Path.join(settings.fs.resources.base, resource, 'lambda'))
    })
  }

  function getAllResourcesWithoutLambda() {
    const allResources = getAllResources()
    return allResources.filter(resource => !Fs.existsSync(Path.join(settings.fs.resources.base, resource, 'lambda')))
                       .filter(resource => (resource !== 'services'))
  }

  function getLambdaPath(resourceName) {
    return Path.join(settings.fs.resources.base, resourceName, 'lambda', lambdas.handler)
  }


  function getServiceResources() {
    const services = Fs.readdirSync(resources.services.base).filter(file => file.indexOf('.') === -1)
    const serviceDefs = services.map((service) => {
      const serviceDef = Path.join(resources.services.base, service, 'service')
      if (Fs.existsSync(`${serviceDef}.js`)) {
        return require(serviceDef) // eslint-disable-line
      }
      return null
    }).filter(s => s !== null)

    return _flattenDeep(serviceDefs)
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
    getResourceTemplatePath, getResourceSwaggerPath, getAllResources, getAllResourcesWithLambda, getAllResourcesWithoutLambda,
    getLambdaPath, getServiceResources,
    getAllWorkflows, getWorkflowPath, getWorkflowArnPath, workflowExists
  }
}


module.exports = fsUtil()
