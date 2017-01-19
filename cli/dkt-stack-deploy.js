const program = require('commander')
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const settings = require('../settings')
const StackHelpers = require('./stackHelpers')

/*
 * ---- description ------------------------------------------------------------
 */
program._name = 'cli/dkt stack deploy'
program
  .description('Deploy Application Stack')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)

const logger = Logger(program._name, program.verbose)
const {
  bundleLambdas,
  putLambdaBundlesToS3,
  createCloudFormationTmpl,
  deployCloudFormationTmpl
} = StackHelpers(logger)


/*
 * ---- task -------------------------------------------------------------------
 */
logger.log('START', 'Deploy Stack')
logger.log('Build Lambdas')

const resources = fsUtil.getAllResources()

return Promise.all(resources.map(resourceFn => Lambda.build(resourceFn)))
  .then(lambdas => bundleLambdas(lambdas, settings.fs.dist.resources))
  .then(lambdaBundles => putLambdaBundlesToS3(lambdaBundles))
  .then(deployedBundles => createCloudFormationTmpl(deployedBundles))
  .then(resourceTmplPath => deployCloudFormationTmpl(resourceTmplPath))
  .then((result) => {
    console.log('deployCloudFormationTmpl', result)
    logger.success('Deploy Stack')
  })
  .catch(err => logger.error(err))
