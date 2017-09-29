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

function createStates(sortedSteps, outputArn, taskInitArn, taskOutputArn) {
  const actions = actionSteps(sortedSteps)

  return actions.reduce(
    (states, step, i) => {
      if (step.service.task) {
        return {
          ...states,
          [stepName(step)]: {
            Type: 'Parallel',
            Branches: [
              {
                StartAt: `${[stepName(step)]}Task`,
                States: {
                  [`${[stepName(step)]}Task`]: {
                    Type: 'Task',
                    Resource: step.service.activityArn,
                    End: true
                  }
                }
              },
              {
                StartAt: `${[stepName(step)]}Init`,
                States: {
                  [`${[stepName(step)]}Init`]: {
                    Type: 'Task',
                    TimeoutSeconds: 65,
                    Resource: taskInitArn,
                    End: true
                  }
                }
              }
            ],
            Next: 'TaskOutputHandler',
            Catch: [
              {
                ErrorEquals: ['States.All'],
                Next: outputResourceName
              }
            ]
          },
          TaskOutputHandler: {
            Type: 'Task',
            Resource: taskOutputArn,
            Next: nextStepName(actions, i),
            Catch: [
              {
                ErrorEquals: ['States.All'],
                Next: outputResourceName
              }
            ]
          }
        }
      }

      return {
        ...states,
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
      }
    },
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
  const taskOutputResource = process.env.TASK_OUTPUT_HANDLER_FUNCTION
  const sortedSteps = _sortBy(flowRun.flow.steps, step => step.position)

  try {
    const outputFunction = await Lambda.getFunction({ FunctionName: outputResource })
    const taskOutputFunction = await Lambda.getFunction({ FunctionName: taskOutputResource })
    const outputArn = outputFunction.Configuration.FunctionArn
    const taskOutputArn = taskOutputFunction.Configuration.FunctionArn
    const taskInitFunction = await Lambda.getFunction({
      FunctionName: process.env.TASK_INITIALIZER_FUNCTION
    })
    const taskInitArn = taskInitFunction.Configuration.FunctionArn

    return JSON.stringify(
      {
        Comment: flowRun.flow.description || '',
        StartAt: stepName(actionSteps(sortedSteps)[0]),
        States: createStates(sortedSteps, outputArn, taskInitArn, taskOutputArn)
      },
      null,
      2
    )
  } catch (err) {
    return Promise.reject(err)
  }
}
