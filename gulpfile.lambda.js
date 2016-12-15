const gulp = require('gulp')
const gutil = require('gulp-util')
const path = require('path')
const zip = require('gulp-zip')
const fsUtil = require('./lib/fsUtil')
const argv = require('yargs').argv


const tasks = (lambda) => {
  gulp.task('lambda:build', (done) => {
    const lambdaFunc = argv.function

    if (lambdaFunc) {
      if (!fsUtil.functionExists(lambdaFunc)) {
        throw new Error(`[Lambda:Build] ${lambdaFunc} does not exist.`)
      }

      lambda.build(lambdaFunc)
        .then(() => done())
        .catch((err) => {
          throw new gutil.PluginError('webpack', err)
        })
    } else {
      lambda.buildAll()
        .then(() => done())
        .catch((err) => {
          throw new gutil.PluginError('webpack', err)
        })
    }
  })


  gulp.task('lambda:bundle', ['lambda:build'], () => {
    const lambdaFunc = argv.function

    if (!lambdaFunc) {
      throw new Error('[Lambda:Bundle] requires function name - run task with \'--function <functionName>\'')
    }

    if (!fsUtil.functionExists(lambdaFunc)) {
      throw new Error(`[Lambda:Build] ${lambdaFunc} does not exist.`)
    }

    gulp.src(`./dist/${lambdaFunc}/index.js`)
      .pipe(zip(`${lambdaFunc}.zip`))
      .pipe(gulp.dest('./dist'))
  })


  gulp.task('lambda:deploy', ['lambda:bundle'], () => {
    const lambdaFunc = argv.function

    if (!lambdaFunc) {
      throw new Error('[Lambda:Deploy] requires function name - run task with \'--function <functionName>\'')
    }

    if (!fsUtil.functionExists(lambdaFunc)) {
      throw new Error(`[Lambda:deploy] ${lambdaFunc} does not exist.`)
    }

    lambda.deploy({
      FunctionName: lambdaFunc,
      ZipFile: path.join(__dirname, 'dist', `${lambdaFunc}.zip`)
    })
  })
}


module.exports = tasks
