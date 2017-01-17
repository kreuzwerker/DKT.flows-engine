const program = require('commander')
const path = require('path')
const fs = require('fs')
const uuidV1 = require('uuid/v1')
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const CloudFormation = require('../lib/aws/cloudFormation')
const S3 = require('../lib/aws/s3')
const settings = require('../settings')


/*
 * ---- description ------------------------------------------------------------
 */
program._name = 'cli/dkt service deploy'
program
  .description('Update Service')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)


/*
 * ---- tasks ------------------------------------------------------------------
 */
logger.log('START', 'Deploy Service')


function bundleLambdas(services, targetBase) {
  return Promise.all(services.map((serviceFn) => {
    logger.log(`Bundle Lambda ${serviceFn}`)
    return Lambda.bundle(serviceFn, targetBase)
  }))
}


function putLambdaBundlesToS3(bundles) {
  return Promise.all(bundles.map(({ fnName, bundlePath }) => {
    const lambdaName = `${fnName}-${uuidV1()}`
    const s3Key = `services/${fnName}/${lambdaName}.zip`

    logger.log(`Put Lambda ${fnName} as ${lambdaName}.zip to S3`)
    return S3.putObject({
      Key: s3Key,
      Body: fs.createReadStream(bundlePath)
    }).then(() => ({
      service: fnName,
      key: s3Key
    }))
  }))
}


function createCloudFormationTmpl(deployedBundles) {
  logger.log('Create CloudFormation definition dkt-flow-engine-template.json')
  const serviceTmplPath = path.join(settings.fs.dist.base, 'dkt-flow-engine-template.json')
  const baseTmpl = require('../src/services/serviceBaseTemplate.json') // eslint-disable-line
  let cloudFormationTmpl = Object.assign({}, baseTmpl, { Resources: {} })

  deployedBundles.forEach(({ service, key }) => {
    const resource = require(fsUtil.getServiceTemplatePath(service)) // eslint-disable-line
    const updatedResource = Object.assign({}, cloudFormationTmpl.Resources, resource({ key }))
    cloudFormationTmpl = Object.assign({}, cloudFormationTmpl, {
      Resources: updatedResource
    })
  })

  fs.writeFileSync(serviceTmplPath, JSON.stringify(cloudFormationTmpl, null, 2))
  return Promise.resolve(serviceTmplPath)
}


function deployCloudFormationTmpl(tmplPath) {
  logger.log('Deploy dkt-flow-engine-template.json')
  return CloudFormation.deploy(tmplPath)
}


logger.log('Build Lambdas')
const services = fsUtil.getAllServices()
return Promise.all(services.map(serviceFn => Lambda.build(serviceFn)))
  .then(lambdas => bundleLambdas(lambdas, settings.fs.dist.base))
  .then(lambdaBundles => putLambdaBundlesToS3(lambdaBundles))
  .then(deployedBundles => createCloudFormationTmpl(deployedBundles))
  .then(serviceTmplPath => deployCloudFormationTmpl(serviceTmplPath))
  .catch(err => console.log(err))
