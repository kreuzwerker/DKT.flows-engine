import _isString from 'lodash/isString'
import StepFunctions from '../../../../utils/stepFunctions'

// THIS IS A TASK WORKER. NOT A REGULAR SERVICE LAMBDA.
// A TASK WORKER CANNOT BE PART OF A STATEMACHINE

export async function handler(event, context, callback) {
  const inputData = _isString(event) ? JSON.parse(event) : event
  const { activityArn } = inputData

  try {
    const { taskToken, input } = await StepFunctions.getActivityTask({ activityArn })

    await StepFunctions.sendTaskSuccess({ taskToken, output: input })

    callback(null, input)
  } catch (err) {
    callback(err)
  }
}
