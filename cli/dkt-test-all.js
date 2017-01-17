require('babel-polyfill')
require('babel-register') // remove this when testing a bundled lambda function
require('../spec/config')
const program = require('commander')
const Mocha = require('mocha')
const Path = require('path')
const fsUtil = require('../lib/fsUtil')
const settings = require('../settings.js')


/*
 * ---- deploy description -----------------------------------------------------
 */
program._name = 'cli/dkt test all'
program
  .description('Test everything')
  .parse(process.argv)

const testBase = Path.join(settings.fs.project.base, 'src')
const mocha = new Mocha({})


/*
 * ---- test everything --------------------------------------------------------
 */
const tests = fsUtil.fromDir(testBase, 'test.js')
tests.map(test => mocha.addFile(test))
mocha.run()
