require('babel-polyfill')
require('babel-register') // remove this when testing a bundled lambda function
require('../spec/config')
const program = require('commander')
const Mocha = require('mocha')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings.js')

/*
 * ---- deploy description -----------------------------------------------------
 */
program._name = 'cli/dkt test workflows'
program
  .description('Test Workflows')
  .parse(process.argv)

const testBase = settings.fs.workflows.base
const mocha = new Mocha({})


/*
 * ---- test all workflows -------------------------------------------------
 */
const tests = fsUtil.fromDir(testBase, 'test.js')
tests.map(test => mocha.addFile(test))
mocha.run()
