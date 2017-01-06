const chai = require('chai')
const settigns = require('../settings')

chai.config.includeStack = settigns.tests.includeStack

global.expect = chai.expect
global.AssertionError = chai.AssertionError
global.Assertion = chai.Assertion
global.assert = chai.assert
