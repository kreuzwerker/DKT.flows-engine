const program = require('commander')
const Logger = require('./logger')
const Lambda = require('../lib/aws/lambda')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings')


/*
 * ---- deploy description -----------------------------------------------------
 */
program._name = 'dkt lambda deploy'
program
  .description('Deploy Functions zip to AWS Lambda')
  .option('-f, --function <name>', 'only one function')
  .option('-F, --file', 'path to directory with the zip file - default: <path/to/repository>/dist/')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)
const zipFileBase = program.file || settings.fs.dist.base
const lambdaFunc = program.function


if (lambdaFunc) {
  /*
   * ---- deploy a single lambda function --------------------------------------
   */
  logger.log('Deploy Lambda', `'${lambdaFunc}'`)

  if (!fsUtil.functionExists(lambdaFunc)) {
    return logger.error(`${lambdaFunc} does not exist.`)
  }

  Lambda.deploy(lambdaFunc, zipFileBase)
    .then(() => logger.success('Deployed Lambda', `'${lambdaFunc}'`))
    .catch(err => logger.error(`Deploying ${lambdaFunc} failed.`, err))
} else {
  /*
   * ---- deploy all lambda functions ------------------------------------------
   */
  logger.log('Deploy Lambdas')

  Lambda.deployAll(zipFileBase)
    .then(() => logger.success('Deployed Lambdas'))
    .catch(err => logger.error('Deploying Lambdas failed.', err))
}
