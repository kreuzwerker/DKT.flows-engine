const argv = require('yargs').argv
const gulp = require('gulp')
const fsUtil = require('./fsUtil')
const StepFunctions = require('./aws/stepFunctions')


const tasks = () => {
  gulp.task('steps:deploy', () => {
    const workflow = argv.workflow

    if (!workflow) {
      throw new Error('[Steps:Deploy] requires workflow name - run task with \'--workflow <workflowName>\'')
    }

    if (!fsUtil.workflowExists(workflow)) {
      throw new Error(`[Steps:Deploy] ${workflow} does not exist.`)
    }

    StepFunctions.deploy(workflow)
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

    StepFunctions.startExecution(workflow, data)
  })
}


module.exports = tasks()
