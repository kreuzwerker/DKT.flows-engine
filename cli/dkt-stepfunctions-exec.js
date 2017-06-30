const program = require('commander')
const Logger = require('./logger')
const StepFunctions = require('../lib/aws/stepFunctions')
const fsUtil = require('../lib/fsUtil')

/*
 * ---- exec description -------------------------------------------------------
 */
program._name = 'cli/dkt stepfunctions exec'
program
  .description('Exec Workflow')
  .option('-w, --workflow <name>', 'only one workflow - required!')
  .option('-d, --data <jsonString>', 'json payload - required!')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)

const logger = Logger(program._name, program.verbose)
const workflow = program.workflow
const data = program.data

if (!workflow) {
  logger.setVerbose(true)
  return logger.error('Missing workflow option')
}

if (!data) {
  logger.setVerbose(true)
  return logger.error('Missing data option')
}

/*
 * ---- exec a single workflow -----------------------------------------------
 */
logger.log('Exec Workflow', `'${workflow}'`)

if (!fsUtil.workflowExists(workflow)) {
  return logger.error(`${workflow} does not exist.`)
}

StepFunctions.startExecution(workflow, data)
  .then(() => logger.success('Executed Workflow', `'${workflow}'`))
  .catch(err => logger.error(`Executing ${workflow} failed.`, err))
