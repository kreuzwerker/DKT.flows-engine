import _sortBy from 'lodash/sortBy'
import Lambda from './lambda'


const outputResource = process.env.STATE_MACHINE_OUTPUT_FUNCTION || 'DKT-flow-engine-Test-StateMachineOutputFunction-Y7JG1AL1HMIX'
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


// const fakeFlowRun = {
//   id: '7b32ec20-5d92-46f9-85c8-f6bb4efd292c',
//   userId: '1',
//   flow: {
//     id: 'ciy0iehaj9wu20133m8gu0lju',
//     name: 'SecondFlow',
//     description: 'This, too, is a mocked flow object',
//     steps: [
//       {
//         id: 'ciy0jgybhai7v013373puyuvy',
//         position: 1,
//         service: {
//           id: 'ciy0jfkvuahth0133z9r38ljg',
//           name: 'Fetch Article',
//           arn: 'arn:aws:lambda:eu-west-1:855433257886:function:DKT-flow-engine-Test-FetchArticleFunction-16SWWTDVOY61Y',
//           type: 'ACTION'
//         }
//       },
//       {
//         id: 'ciy0jidbmaivt0133sqdy35e6',
//         position: 0,
//         service: {
//           id: 'ciy0jeruzbb5m01790ymkz7xl',
//           name: 'URL_INPUT',
//           arn: null,
//           type: 'TRIGGER'
//         }
//       }
//     ]
//   }
// }
