const program = require('commander')
const Logger = require('./logger')
const Lambda = require('../lib/aws/lambda')
const settings = require('../settings')

/*
 * ---- bundle description -----------------------------------------------------
 */
program._name = 'cli/dkt lambda bundle'
program
  .description('Bundle Functions to zip files')
  .option('-f, --function <name>', 'only one function')
  .option('-i, --input <path>', 'path to directory with functions - default: <path/to/repository>/dist/')
  .option('-o, --output <path>', 'path to output directory - default: <path/to/repository>/dist/')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)


const logger = Logger(program._name, program.verbose)
const inputDir = program.input || settings.fs.dist.base
const outputDir = program.output || settings.fs.dist.base
const lambdaFunc = program.function

if (lambdaFunc) {
  /*
   * ---- bundle a single lambda function --------------------------------------
   */
  logger.log('Bundle Lambda', `'${lambdaFunc}'`)
  Lambda.bundle(lambdaFunc, inputDir, outputDir)
    .then(() => logger.success(`Bundled Lambda '${lambdaFunc}'.`))
    .catch(err => logger.error(`Bundling Lambda '${lambdaFunc}' failed.`, err))
} else {
  /*
   * ---- bundle all lambda functions ------------------------------------------
   */
  logger.log('Bundle Lambdas')
  Lambda.bundleAll(inputDir, outputDir)
    .then(() => logger.success('Bundled all Lambda Functions'))
    .catch(err => logger.error('Bundling Lambdas failed.', err))
}
