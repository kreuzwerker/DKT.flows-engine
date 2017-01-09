const program = require('commander')
const Logger = require('./logger')
const ApiGateway = require('../lib/aws/apiGateway')


/*
 * ---- build description ------------------------------------------------------
 */
program._name = 'cli/dkt api deploy'
program
  .description('Update ApiGateway')
  .option('-s, --stage <name>', 'stage to deploy')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)
const stage = program.stage

if (!stage) {
  return logger.error('Missing required stage parameter')
}

/*
 * ---- build a single lambda function ---------------------------------------
 */
logger.log('START', 'Deploy ApiGateway')

ApiGateway.deploy(stage)
  .then(() => logger.success('Deployed Api'))
  .catch(err => logger.error('Deploying Api failed.', err))
