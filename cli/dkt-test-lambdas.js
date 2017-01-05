require('babel-polyfill') // remove this when testing a bundled lambda function
require('babel-register')
require('../spec/config')
const program = require('commander')
const Mocha = require('mocha')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings.js')


/*
 * ---- deploy description -----------------------------------------------------
 */
program._name = 'cli/dkt test lambdas'
program
  .description('Test Lambdas')
  .option('-f, --function <name>', 'only one function')
  .parse(process.argv)


const lambdaFunc = program.function
const testBase = settings.fs.functions.base
const mocha = new Mocha({})

let tests = []

if (lambdaFunc) {
  tests = fsUtil.fromDir(testBase, `${lambdaFunc}/test.js`)
} else {
  tests = fsUtil.fromDir(testBase, 'test.js')
}

tests.map(test => mocha.addFile(test))
mocha.run()
