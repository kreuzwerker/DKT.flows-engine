const program = require('commander')
const Logger = require('./logger')
const Lambda = require('../lib/aws/lambda')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings')

/*
 * ---- bundle description -----------------------------------------------------
 */
program._name = 'dkt lambda bundle'
program
  .description('Build Functions')
  .option('-f, --function <name>', 'only one function')
  .option('-o, --output <path>', 'path to output directory - default: <path/to/repository>/dist/')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)
const outputDir = program.output || settings.fs.dist.base
const lambdaFunc = program.function


if (lambdaFunc) {
  /*
   * ---- bundle a single lambda function --------------------------------------
   */
  logger.log('START', 'Build Lambda', `'${lambdaFunc}'`)

  if (!fsUtil.functionExists(lambdaFunc)) {
    return logger.error(`${lambdaFunc} does not exist.`)
  }

  Lambda.build(lambdaFunc, outputDir)
    .then(() => logger.success('Built Lambda', `'${lambdaFunc}'`))
    .catch(err => logger.error(`Building ${lambdaFunc} failed.`, err))
} else {
  /*
   * ---- bundle all lambda functions ------------------------------------------
   */

  logger.log('START', 'Build Lambdas')
  Lambda.buildAll(outputDir)
    .then(() => logger.success('Built Lambdas'))
    .catch(err => logger.error('Building Lambdas failed.', err))
}
