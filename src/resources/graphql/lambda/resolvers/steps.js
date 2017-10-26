import uuid from 'uuid'
import {
  getFlowById,
  updateFlow,
  setFlowDraftState,
  generateFlowStepsPositions,
  regenerateFlowStepsPositions
} from './flows'
import { getServiceById } from './services'
import Lambda from '../../../../utils/lambda'
import S3 from '../../../../utils/s3'
import timestamp from '../../../../utils/timestamp'
import {
  createTestStepDataParams,
  createTestStepTriggerParams
} from '../../../../utils/helpers/stepHelpers'
import * as dbSteps from '../../../dbSteps/resolvers'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allSteps() {
  return dbSteps.allSteps()
}

export function getStepById(stepId) {
  return dbSteps.getStepById(stepId)
}

export function batchGetStepByIds(stepsIds) {
  return dbSteps.batchGetStepByIds(stepsIds)
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createStep(step) {
  // set defaults
  const newStep = Object.assign(
    {},
    {
      id: uuid.v4(),
      position: 0,
      description: null,
      flow: null,
      service: null,
      configParams: null
    },
    step
  )

  try {
    if (newStep.flow) {
      const flow = await getFlowById(newStep.flow)
      if (flow) {
        flow.steps.push(newStep.id)
        await updateFlow(flow)
        await setFlowDraftState(flow, true)
        await generateFlowStepsPositions(flow, newStep)
      }
    }

    return dbSteps.createStep(newStep)
  } catch (err) {
    return Promise.reject(err)
  }
}

async function updateFlowDraftState(step) {
  // Load step with flow object
  const stepObj = !step.flow ? await getStepById(step.id) : step

  if (stepObj && stepObj.flow) {
    const flow = await getFlowById(stepObj.flow)

    if (flow) {
      return setFlowDraftState(flow, true)
    }
  }
  return Promise.resolve()
}

export async function updateStep(step) {
  return updateFlowDraftState(step).then(() => dbSteps.updateStep(step))
}

export async function testStep(stepId, payload, configParams) {
  const s3 = S3(process.env.S3_BUCKET)
  try {
    const step = await getStepById(stepId)
    const service = await getServiceById(step.service)
    const runId = `${timestamp()}_${uuid.v4()}`
    const testStepData = createTestStepDataParams(step, runId, payload, configParams)
    const invokeParams = createTestStepTriggerParams(stepId, service.arn, runId)

    if (service.type === 'TRIGGER') {
      const newStep = Object.assign({}, step, { tested: true })
      await updateStep(newStep)
      return Object.assign({}, newStep, { service })
    }

    await s3.putObject(testStepData)

    const stepResult = await Lambda.invoke(invokeParams)
    const parsedStepResult = JSON.parse(stepResult.Payload)
    const stepOutput = await s3.getObject({ Key: parsedStepResult.key })
    const output = JSON.parse(stepOutput.Body.toString())
    const testedStep = step
    let result = {}

    if (output.status === 'error') {
      testedStep.tested = false
      result = Object.assign({}, testedStep, {
        service,
        error: output[parsedStepResult.contentKey]
      })
    } else {
      testedStep.tested = true
      result = Object.assign({}, testedStep, {
        service,
        result: JSON.stringify(output[parsedStepResult.contentKey])
      })
    }

    await Promise.all([
      updateStep(testedStep),
      s3.deleteObject({ Key: testStepData.Key }),
      s3.deleteObject({ Key: parsedStepResult.key })
    ])

    return result
  } catch (err) {
    return err
  }
}

export async function deleteStep(id) {
  const step = await getStepById(id)

  try {
    if (step.flow) {
      const flow = await getFlowById(step.flow)
      if (flow) {
        flow.steps = flow.steps.filter(stepId => stepId !== step.id)
        await updateFlow(flow)
        await setFlowDraftState(flow, true)
        await regenerateFlowStepsPositions(flow)
      }
    }

    await dbSteps.deleteStep(id)

    return {
      id: id,
      // NB after deleting the step from the DB, GraphQL won't be able to retrieve
      // the related flow entity anymore. Hence we manually include it in the
      // response so the client will be able to e.g. request the current
      // flow.draft state within the deleteStep mutation.
      flow: step.flow || null
    }
  } catch (err) {
    return Promise.reject(err)
  }
}
