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
program._name = 'cli/dkt test resources'
program
  .description('Test Resources')
  .option('-r, --resource <name>', 'only one resource')
  .parse(process.argv)

const lambdaFn = program.resource
const testBase = settings.fs.resources.base
const mocha = new Mocha({})

let tests = []

if (lambdaFn) {
  tests = fsUtil.fromDir(`${testBase}/${lambdaFn}`, 'test.js')
} else {
  tests = fsUtil.fromDir(testBase, 'test.js')
}

tests.map(test => mocha.addFile(test))
mocha.run()
