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
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)

const logger = Logger(program._name, program.verbose)
const {
  bundleLambdas,
  putLambdaBundlesToS3,
  createCloudFormationTmpl
} = StackHelpers(logger)


/*
 * ---- task -------------------------------------------------------------------
 */
logger.log('START', 'Build Stack')
logger.log('Build Lambdas')

const resources = fsUtil.getAllResources()

return Promise.all(resources.map(resourceFn => Lambda.build(resourceFn)))
  .then(lambdas => bundleLambdas(lambdas, settings.fs.dist.base))
  .then(lambdaBundles => putLambdaBundlesToS3(lambdaBundles))
  .then(deployedBundles => createCloudFormationTmpl(deployedBundles))
  .then(() => logger.success('Built Stack'))
  .catch(err => logger.error(err))
