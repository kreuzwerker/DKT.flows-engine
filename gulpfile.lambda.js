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


  gulp.task('lambda:bundle', ['lambda:build'], (done) => {
    const lambdaFunc = argv.function

    if (lambdaFunc) {
      if (!fsUtil.functionExists(lambdaFunc)) {
        throw new Error(`[Lambda:bundle] ${lambdaFunc} does not exist.`)
      }

      gulp.src(`./dist/${lambdaFunc}/index.js`)
        .pipe(zip(`${lambdaFunc}.zip`))
        .pipe(gulp.dest('./dist'))
        .on('end', () => done())
    } else {
      const allFunctions = fsUtil.getAllFunctions()

      const promisedTask = func => new Promise((resolve, reject) => {
        gulp.src(`./dist/${func}/index.js`)
          .pipe(zip(`${func}.zip`))
          .pipe(gulp.dest('./dist'))
          .on('end', () => resolve())
          .on('error', error => reject(error))
      })

      Promise.all(allFunctions.map(func => promisedTask(func)))
        .then(() => done())
        .catch((err) => {
          throw new Error('[Lambda:bundle]', err)
        })
    }
  })


  gulp.task('lambda:deploy', ['lambda:bundle'], (done) => {
    const lambdaFunc = argv.function
    const zipFileBase = path.join(__dirname, 'dist')

    if (lambdaFunc) {
      if (!fsUtil.functionExists(lambdaFunc)) {
        throw new Error(`[Lambda:deploy] ${lambdaFunc} does not exist.`)
      }

      lambda.deploy(lambdaFunc, zipFileBase).then(() => done())
    } else {
      lambda.deployAll(zipFileBase).then(() => done())
    }
  })
}


module.exports = tasks
