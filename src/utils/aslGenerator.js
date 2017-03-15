import _sortBy from 'lodash/sortBy'
import Lambda from './lambda'


const outputResource = process.env.STATE_MACHINE_OUTPUT_FUNCTION
const outputResourceName = 'StatesMachineOutput'


function aslSaveName(currentStep) {
  return currentStep.service.name.replace(' ', '')
}


function nextStepName(sortedSteps, currentIndex) {
  if (sortedSteps[currentIndex + 1]) {
    return aslSaveName(sortedSteps[currentIndex + 1])
  }
  return outputResourceName
}


function actionSteps(sortedSteps) {
  return sortedSteps.filter(step => step.service.type === 'ACTION')
}


function createStates(sortedSteps, outputArn) {
  const actions = actionSteps(sortedSteps)
  const states = actions.reduce((s, step, i) => {
    s[aslSaveName(step)] = {
      Type: 'Task',
      Resource: step.service.arn,
      Next: nextStepName(actions, i),
      Catch: [{
        ErrorEquals: ['States.All'],
        Next: outputResourceName
      }]
    }
    return s
  }, {})

  states[outputResourceName] = {
    Type: 'Task',
    Resource: outputArn,
    End: true
  }

  return states
}


export default async function createASL(flowRun) {
  const sortedSteps = _sortBy(flowRun.flow.steps, step => step.position)

  try {
    const outputFunction = await Lambda.getFunction({ FunctionName: outputResource })
    const outputArn = outputFunction.Configuration.FunctionArn

    return JSON.stringify({
      Comment: flowRun.flow.description || '',
      StartAt: aslSaveName(actionSteps(sortedSteps)[0]),
      States: createStates(sortedSteps, outputArn)
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
