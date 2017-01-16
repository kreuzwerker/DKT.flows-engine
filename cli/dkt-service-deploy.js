const program = require('commander')
const path = require('path')
const uuidV1 = require('uuid/v1')
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const settings = require('../settings')



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
 * ---- taks -------------------------------------------------------------------
 */
logger.log('START', 'Deploy Service')

const servicePath = settings.fs.services.base
const ServiceTemplate = require(fsUtil.getServiceTemplatePath(service)) // eslint-disable-line
const serviceTemplate = ServiceTemplate({ lambda: uuidV1() })


Lambda.build(service)
  .then(() => Lambda.bundle(service, settings.fs.dist.base))
  .then(() => {
    console.log('done')
    // TODO push zip to s3 and run service deployment via cloudformation
  })
  .catch(err => console.error(err))
