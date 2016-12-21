require('babel-core/register')
const argv = require('yargs').argv
const del = require('del')
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const path = require('path')


/*
 * ---- Tests ------------------------------------------------------------------
 */
gulp.task('test', () => {
  const lambdaFunc = argv.function
  const functions = argv.functions
  const workflows = argv.workflows

  let tests = './src/**/*test.js'

  if (lambdaFunc) {
    tests = path.join(__dirname, 'src', 'functions', lambdaFunc, 'test.js')
  }

  if (functions) {
    tests = path.join(__dirname, 'src', 'functions', '**', 'test.js')
  }

  if (workflows) {
    tests = path.join(__dirname, 'src', 'workflows', 'test.js')
  }

  gulp.src(tests).pipe(mocha({
    require: [
      'babel-polyfill', // remove this when testing a bundled lambda function
      './spec/config'
    ]
  }))
  .once('error', () => process.exit(1))
  .once('end', () => process.exit())
})


/*
 * ---- Cleaning ---------------------------------------------------------------
 */
gulp.task('clean', done => del(['./dist'], done))


/*
 * ---- AWS Lambda -------------------------------------------------------------
 * ---- see gulpfile.lambda.js for lambda specific tasks -----------------------
 */
require('./lib/gulpfile.lambda')


/*
 * ---- AWS StepFunctions ------------------------------------------------------
 * ---- see gulpfile.stepfunctions.js for stepfunction specific tasks ----------
 */
require('./lib/gulpfile.stepfunctions')
