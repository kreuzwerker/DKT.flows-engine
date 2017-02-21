const program = require('commander')
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const settings = require('../settings')
const StackHelpers = require('./stackHelpers')

/*
 * ---- description ------------------------------------------------------------
 */
program._name = 'cli/dkt stack build'
program
  .description('Build Application Stack')
  .option('-s, --stage <name>', 'stage Dev || Staging || Production - default: Dev')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)

const logger = Logger(program._name, program.verbose)
const stage = program.stage || 'Dev'

if (stage !== 'Dev' && stage !== 'Test' && stage !== 'Staging' && stage !== 'Production') {
  logger.error(`Invalid stage '${stage}' - Use 'Dev', 'Test', 'Staging' or 'Production'`)
  console.log('                             e.g. cli/dkt stack deploy -s Dev')
  return
}
const {
  bundleLambdas,
  putLambdaBundlesToS3,
  createCloudFormationTmpl
} = StackHelpers(logger)


/*
 * ---- task -------------------------------------------------------------------
 */
logger.log('START', 'Build Stack', stage)
logger.log('Build Lambdas')

const lambdaResources = fsUtil.getAllResourcesWithLambda()

return Promise.all(lambdaResources.map(resourceFn => Lambda.build(resourceFn)))
  .then(lambdas => bundleLambdas(lambdas, settings.fs.dist.resources))
  .then(lambdaBundles => putLambdaBundlesToS3(lambdaBundles, stage))
  .then(deployedBundles => createCloudFormationTmpl(deployedBundles, stage))
  .then(() => logger.success('Built Stack'))
  .catch(err => logger.error(err))
