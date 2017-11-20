import _isString from 'lodash/isString'
import StepFunctions from '../../../../utils/stepFunctions'
import service from '../../../../utils/service'
import task from '../../../../utils/taskWorker'

// THIS FUNCTION IS NOT IN USE ANYMORE
// TODO WE NEED TO UPDATE THE DEPLOYMENT TOOL TO IGNORE THIS

async function approveWorker(inputData) {
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
