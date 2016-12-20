const argv = require('yargs').argv
const gulp = require('gulp')
const fsUtil = require('./lib/fsUtil')


const tasks = (stepFunctions) => {
  gulp.task('steps:deploy', () => {
    const workflow = argv.workflow

    if (!workflow) {
      throw new Error('[Steps:Deploy] requires workflow name - run task with \'--workflow <workflowName>\'')
    }

    if (!fsUtil.workflowExists(workflow)) {
      throw new Error(`[Steps:Deploy] ${workflow} does not exist.`)
    }

    stepFunctions.deploy(workflow)
  })


  gulp.task('steps:exec', () => {
    const workflow = argv.workflow
    const data = argv.data

    if (!workflow) {
      throw new Error('[Steps:Exec] requires workflow name - run task with \'--workflow <workflowName>\'')
    }

    if (!fsUtil.workflowExists(workflow)) {
      throw new Error(`[Steps:Exec] ${workflow} does not exist.`)
    }

    if (!data) {
      throw new Error('[Steps:Exec] requires data - run task with \'--data <dataJSON>\'')
    }

    stepFunctions.startExecution(workflow, data)
  })
}


module.exports = tasks
