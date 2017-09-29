import _isString from 'lodash/isString'
import StepFunctions from '../../../../utils/stepFunctions'
import service from '../../../../utils/service'
import task from '../../../../utils/taskWorker'

// THIS IS A TASK WORKER. NOT A REGULAR SERVICE LAMBDA.
// A TASK WORKER CANNOT BE PART OF A STATEMACHINE

async function approveWorker(inputData) {
  // logger.log(JSON.stringify(inputData, null, 2))
  // logger.log('')
  // logger.log(JSON.stringify(stepData, null, 2))
  // return Promise.resolve('')
  const { activityArn } = inputData

  try {
    const { taskToken, input } = await StepFunctions.getActivityTask({ activityArn })

    await StepFunctions.sendTaskSuccess({ taskToken, output: input })

    return input
  } catch (err) {
    return Promise.reject(err)
  }
}

// export const handler = service(task(approveWorker))
export const handler = approveWorker
