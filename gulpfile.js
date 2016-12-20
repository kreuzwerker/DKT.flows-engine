require('babel-core/register')
const argv = require('yargs').argv
const del = require('del')
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const path = require('path')
const Lambda = require('./lib/aws/lambda')
const StepFunctions = require('./lib/aws/stepFunctions')


/*
 * ---- Tests ------------------------------------------------------------------
 */
gulp.task('test', () => {
  const lambdaFunc = argv.function
  let tests = './src/**/test.js'

  if (lambdaFunc) {
    tests = path.join(__dirname, 'src', 'functions', lambdaFunc, 'test.js')
  }

  gulp.src(tests).pipe(mocha({
    require: [
      'babel-polyfill', // remove this when testing a bundled lambda function
      './spec/config'
    ]
  }))
})


/*
 * ---- Cleaning ---------------------------------------------------------------
 */
gulp.task('clean', done => del(['./dist'], done))


/*
 * ---- AWS Lambda -------------------------------------------------------------
 * ---- see gulpfile.lambda.js for lambda specific tasks -----------------------
 */
require('./gulpfile.lambda')(Lambda)


/*
 * ---- AWS StepFunctions ------------------------------------------------------
 * ---- see gulpfile.stepfunctions.js for stepfunction specific tasks ----------
 */
require('./gulpfile.stepfunctions')(StepFunctions)
