const program = require('commander')
const Logger = require('./logger')
const StepFunctions = require('../lib/aws/stepFunctions')
const fsUtil = require('../lib/fsUtil')

/*
 * ---- deploy description -----------------------------------------------------
 */
program._name = 'cli/dkt stepfunctions deploy'
program
  .description('Deploy Workflows')
  .option('-w, --workflow <name>', 'only one workflow')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)
const workflow = program.workflow

if (workflow) {
  /*
   * ---- deploy a single workflow ---------------------------------------------
   */
  logger.log('Deploy Workflow', `'${workflow}'`)

  if (!fsUtil.workflowExists(workflow)) {
    return logger.error(`${workflow} does not exist.`)
  }

  StepFunctions.deploy(workflow)
    .then(() => logger.success('Deployed Workflow', `'${workflow}'`))
    .catch(err => logger.error(`Deploying ${workflow} failed.`, err))
} else {
  /*
   * ---- deploy all workflows -------------------------------------------------
   */
  StepFunctions.deployAll()
    .then(() => logger.success('Deployed Workflows'))
    .catch(err => logger.error('Deploying Workflows failed.', err))
}
