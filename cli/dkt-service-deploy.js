const program = require('commander')
const path = require('path')
const fs = require('fs')
const uuidV1 = require('uuid/v1')
const exec = require('child_process').exec
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const S3 = require('../lib/aws/s3')
const settings = require('../settings')


const execPromise = command => new Promise((resolve, reject) => {
  exec(command, (err, stdout, stderr) => {
    if (err) return reject(err)
    if (stderr) return reject(stderr)
    return resolve(stdout)
  })
})


/*
 * ---- description ------------------------------------------------------------
 */
program._name = 'cli/dkt service deploy'
program
  .description('Update Service')
  .option('-s, --service <name>', 'service to deploy - required!')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)
const service = program.service

if (!service) {
  return logger.error('Missing required service parameter')
}

/*
 * ---- tasks ------------------------------------------------------------------
 */
logger.log('START', 'Deploy Service')


const lambdaName = `${service}-${uuidV1()}`
const s3Key = `services/${service}/${lambdaName}.zip`
const stackName = settings.aws.cloudFormation.stackName
const capabilities = settings.aws.cloudFormation.capabilities
const region = settings.aws.cloudFormation.region
const serviceTmplPath = path.join(settings.fs.dist.base, `${service}-template.json`)


function bundleLambda(fn, base) {
  logger.log(`Bundle Lambda ${fn}`)
  return Lambda.bundle(fn, base)
}


function putLambdaToS3(fn, key, zip) {
  logger.log(`Put Lambda ${fn} to S3`)
  return S3.putObject({ Key: key, Body: fs.createReadStream(zip) })
}


function createCloudFormationTmpl(svcName, tmplPath, key) {
  logger.log(`Create CloudFormation definition ${svcName}-template.json`)
  const baseTmpl = require('../src/services/serviceBaseTemplate.json') // eslint-disable-line
  const resource = require(fsUtil.getServiceTemplatePath(svcName)) // eslint-disable-line
  const cloudFormationTmpl = Object.assign({}, baseTmpl, {
    Resources: resource({ key })
  })

  fs.writeFileSync(tmplPath, JSON.stringify(cloudFormationTmpl, null, 2))
  return Promise.resolve()
}


function deployCloudFormationTmpl(svcName, tmplPath) {
  logger.log(`Deploy ${svcName}-template.json`)
  return execPromise(`aws cloudformation deploy --template-file ${tmplPath} --stack-name ${stackName} --capabilities ${capabilities} --region ${region}`)
}


logger.log(`Build Lambda ${service}`)
return Lambda.build(service)
  .then(() => bundleLambda(service, settings.fs.dist.base))
  .then(zip => putLambdaToS3(service, s3Key, zip))
  .then(() => createCloudFormationTmpl(service, serviceTmplPath, s3Key))
  .then(() => deployCloudFormationTmpl(service, serviceTmplPath))
  .then(res => logger.log(res))
  .catch(err => console.error(err))
