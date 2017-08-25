import _sortBy from 'lodash/sortBy'
import Lambda from './lambda'

const outputResourceName = 'StatesMachineOutput'

function stepName(step) {
  return step.service.name.replace(' ', '')
}

function nextStepName(sortedSteps, currentIndex) {
  if (sortedSteps[currentIndex + 1]) {
    return stepName(sortedSteps[currentIndex + 1])
  }
  return outputResourceName
}

function actionSteps(sortedSteps) {
  return sortedSteps.filter(step => step.service.type === 'ACTION')
}

function createStates(sortedSteps, outputArn) {
  const actions = actionSteps(sortedSteps)

  return actions.reduce(
    (states, step, i) =>
      Object.assign(states, {
        [stepName(step)]: {
          Type: 'Task',
          Resource: step.service.task ? step.service.activityArn : step.service.arn,
          Next: nextStepName(actions, i),
          Catch: [
            {
              ErrorEquals: ['States.All'],
              Next: outputResourceName
            }
          ]
        }
      }),
    {
      [outputResourceName]: {
        Type: 'Task',
        Resource: outputArn,
        End: true
      }
    }
  )
}

export default async function createASL(flowRun) {
  const outputResource = process.env.STATE_MACHINE_OUTPUT_FUNCTION
  const sortedSteps = _sortBy(flowRun.flow.steps, step => step.position)

  try {
    const outputFunction = await Lambda.getFunction({ FunctionName: outputResource })
    const outputArn = outputFunction.Configuration.FunctionArn

    return JSON.stringify(
      {
        Comment: flowRun.flow.description || '',
        StartAt: stepName(actionSteps(sortedSteps)[0]),
        States: createStates(sortedSteps, outputArn)
      },
      null,
      2
    )
  } catch (err) {
    return Promise.reject(err)
  }
}
