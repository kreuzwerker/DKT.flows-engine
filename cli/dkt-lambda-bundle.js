const program = require('commander')
const path = require('path')
const fs = require('fs')
const yazl = require('yazl')
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings')

/*
 * ---- bundle description -----------------------------------------------------
 */
program._name = 'dkt lambda bundle'
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
const defaultHandler = settings.fs.functions.handler

if (lambdaFunc) {
  /*
   * ---- bundle a single lambda function --------------------------------------
   */
  logger.log('Bundle Lambda', `'${lambdaFunc}'`)
} else {
  /*
   * ---- bundle all lambda functions ------------------------------------------
   */

  logger.log('Bundle Lambdas')
  logger.log('TODO')
}
