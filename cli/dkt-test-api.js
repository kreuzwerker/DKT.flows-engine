require('babel-polyfill')
require('babel-register') // remove this when testing a bundled lambda function
require('../spec/config')
const program = require('commander')
const Mocha = require('mocha')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings.js')

/*
 * ---- test description -------------------------------------------------------
 */
program._name = 'cli/dkt test workflows'
program
  .description('Test Api paths')
  .parse(process.argv)

const testBase = settings.fs.api.base
const mocha = new Mocha({})


/*
 * ---- test all paths ---------------------------------------------------------
 */
const tests = fsUtil.fromDir(testBase, 'test.js')
tests.map(test => mocha.addFile(test))
mocha.run()
