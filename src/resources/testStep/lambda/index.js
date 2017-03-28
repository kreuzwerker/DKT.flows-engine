import _isString from 'lodash/isString'
import uuid from 'uuid'
import Lambda from '../../../utils/lambda'
import S3 from '../../../utils/s3'
import { createTestStepDataParams, createTestStepTriggerParams } from '../../../utils/helpers/stepHelpers'
import timestamp from '../../../utils/timestamp'
import { getStepById, updateStep } from '../../dbSteps/resolvers'
import { getServiceById } from '../../dbServices/resolvers'


export async function handler(event, context, callback) {
  const { stepId, payload } = _isString(event) ? JSON.parse(event) : event
  const s3 = S3(process.env.S3_BUCKET)

  try {
    const step = await getStepById(stepId)
    const service = await getServiceById(step.service)
    const runId = `${timestamp()}_${uuid.v4()}`
    const testStepData = createTestStepDataParams(stepId, runId, payload)
    const invokeParams = createTestStepTriggerParams(stepId, service.arn, runId)

    if (service.type === 'TRIGGER') {
      const newStep = Object.assign({}, step, { tested: true })
      await updateStep(newStep)
      return callback(null, Object.assign({}, newStep, { service }))
    }

    await s3.putObject(testStepData)

    const stepResult = await Lambda.invoke(invokeParams)
    const parsedResult = JSON.parse(stepResult.Payload)
    const stepOutput = await s3.getObject({ Key: parsedResult.key })
    const result = JSON.parse(stepOutput.Body.toString())
    let testedStep = {},
        successParams = {}

    if (result.status === 'error') {
      testedStep = Object.assign({}, step, { tested: false })
      successParams = Object.assign({}, testedStep, { service, error: result })
    } else {
      testedStep = Object.assign({}, step, { tested: true })
      successParams = Object.assign({}, testedStep, { service, result })
    }

    await Promise.all([
      updateStep(testedStep),
      s3.deleteObject({ Key: testStepData.Key }),
      s3.deleteObject({ Key: parsedResult.key })
    ])

    return callback(null, successParams)
  } catch (err) {
    return callback(err)
  }
}
