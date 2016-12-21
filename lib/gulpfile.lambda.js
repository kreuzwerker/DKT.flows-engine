const gulp = require('gulp')
const gutil = require('gulp-util')
const path = require('path')
const zip = require('gulp-zip')
const argv = require('yargs').argv
const fsUtil = require('./fsUtil')
const Lambda = require('./aws/lambda')


const tasks = () => {
  gulp.task('lambda:build', (done) => {
    const lambdaFunc = argv.function

    if (lambdaFunc) {
      if (!fsUtil.functionExists(lambdaFunc)) {
        throw new Error(`[Lambda:Build] ${lambdaFunc} does not exist.`)
      }

      Lambda.build(lambdaFunc)
        .then(() => done())
        .catch((err) => {
          throw new gutil.PluginError('webpack', err)
        })
    } else {
      Lambda.buildAll()
        .then(() => done())
        .catch((err) => {
          throw new gutil.PluginError('webpack', err)
        })
    }
  })


  gulp.task('lambda:bundle', ['lambda:build'], (done) => {
    const lambdaFunc = argv.function
    const promisedTask = func => new Promise((resolve, reject) => {
      gulp.src(path.join(__dirname, '..', 'dist', func, 'index.js'))
        .pipe(zip(`${func}.zip`))
        .pipe(gulp.dest(path.join(__dirname, '..', 'dist')))
        .on('end', () => resolve())
        .on('error', error => reject(error))
    })

    if (lambdaFunc) {
      if (!fsUtil.functionExists(lambdaFunc)) {
        throw new Error(`[Lambda:bundle] ${lambdaFunc} does not exist.`)
      }

      promisedTask(lambdaFunc).then(() => done())
    } else {
      const allFunctions = fsUtil.getAllFunctions()

      Promise.all(allFunctions.map(func => promisedTask(func)))
        .then(() => done())
        .catch((err) => {
          throw new Error('[Lambda:bundle]', err)
        })
    }
  })


  gulp.task('lambda:deploy', ['lambda:bundle'], (done) => {
    const lambdaFunc = argv.function
    const zipFileBase = path.join(__dirname, '..', 'dist')

    if (lambdaFunc) {
      if (!fsUtil.functionExists(lambdaFunc)) {
        throw new Error(`[Lambda:deploy] ${lambdaFunc} does not exist.`)
      }

      Lambda.deploy(lambdaFunc, zipFileBase).then(() => done())
    } else {
      Lambda.deployAll(zipFileBase).then(() => done())
    }
  })
}


module.exports = tasks()
