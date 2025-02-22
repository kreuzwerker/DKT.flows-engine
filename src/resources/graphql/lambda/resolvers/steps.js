import uuid from 'uuid'
import {
  getFlowById,
  updateFlow,
  setFlowDraftState,
  generateFlowStepsPositions,
  regenerateFlowStepsPositions
} from './flows'
import { getServiceById } from './services'
import { S3, Lambda, SSM } from '../../../../utils/aws'
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

function decryptConfigParams(step) {
  const { configParams } = step
  if (!configParams || configParams.length === 0) {
    return Promise.resolve(step)
  }

  return Promise.all(configParams.map((param) => {
    if (param.secret) {
      const secretName = SSM.createParameterName(step.id, param.fieldId)
      return SSM.getParameter({ Name: secretName }, true)
        .then(res => ({ ...param, value: res.Parameter.Value }))
        .catch(() => param)
    }

    return Promise.resolve(param)
  })).then(decryptedConfigParams => ({ ...step, configParams: decryptedConfigParams }))
}

export function getStepById(stepId) {
  return dbSteps.getStepById(stepId).then(step => decryptConfigParams(step))
}

export function batchGetStepByIds(stepsIds) {
  return dbSteps
    .batchGetStepByIds(stepsIds)
    .then(steps => Promise.all(steps.map(step => decryptConfigParams(step))))
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createStep(step, userId) {
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
      const flow = await getFlowById(newStep.flow, userId)
      if (flow) {
        flow.steps.push(newStep.id)
        await updateFlow(flow)
        await generateFlowStepsPositions(flow, newStep)
      }
    }

    return dbSteps.createStep(newStep)
  } catch (err) {
    return Promise.reject(err)
  }
}

async function updateFlowDraftState(step, userId) {
  // Load step with flow object
  const stepObj = !step.flow ? await getStepById(step.id) : step

  if (stepObj && stepObj.flow) {
    const flow = await getFlowById(stepObj.flow, userId)

    if (flow) {
      return setFlowDraftState(flow, true)
    }
  }
  return Promise.resolve()
}

function updateSecretParameters(step) {
  const { configParams } = step

  if (!configParams || configParams.length === 0) {
    return Promise.resolve(step)
  }

  function getDecryptedValueIfPossible(secretName) {
    return SSM.getParameter({ Name: secretName }, true)
      .then((res) => {
        if (res.Parameter && res.Parameter.Value) {
          return res.Parameter.Value
        }
        return null
      })
      .catch((err) => {
        console.log(err)
        return null
      })
  }

  return Promise.all(configParams.map((param) => {
    if (!param.secret) {
      return Promise.resolve({ ...param, secret: false })
    }

    const secretName = SSM.createParameterName(step.id, param.fieldId)
    const parameterParams = {
      Name: secretName,
      Value: param.value,
      Overwrite: true
    }

    return getDecryptedValueIfPossible(secretName)
      .then((value) => {
        if (value) {
          parameterParams.Value = value
        }

        return SSM.putParameter(parameterParams)
      })
      .then(() => SSM.getParameter({ Name: secretName }, false))
      .then(({ Parameter }) => {
        return {
          ...param,
          value: Parameter.Value,
          secret: true
        }
      })
  })).then(updatedConfigParams => ({ ...step, configParams: updatedConfigParams }))
}

export async function updateStep(step, userId) {
  return updateFlowDraftState(step, userId)
    .then(() => updateSecretParameters(step))
    .then(updatedStep => dbSteps.updateStep(updatedStep))
}

export async function testStep(stepId, payload) {
  const s3 = S3(process.env.S3_BUCKET)
  try {
    const step = await getStepById(stepId)
    const service = await getServiceById(step.service)
    const runId = `${timestamp()}_${uuid.v4()}`
    const testStepData = createTestStepDataParams(step, runId, payload)
    const invokeParams = createTestStepTriggerParams(stepId, service.arn, runId)

    if (service.type === 'TRIGGER') {
      const newStep = { ...step, tested: true }
      await updateStep(newStep)
      return { ...newStep, service }
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
      result = { ...testedStep, service, error: output[parsedStepResult.contentKey] }
    } else {
      testedStep.tested = true

      let _result = output[parsedStepResult.contentKey]
      if (typeof _result === 'object') {
        // NB StepTestType.result must be a string
        _result = JSON.stringify(output[parsedStepResult.contentKey])
      }

      result = {
        ...testedStep,
        service,
        result: _result
      }
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

export async function deleteStep(id, userId) {
  const step = await getStepById(id)
  if (!step) {
    console.log("Step doesn't exist anymore")
    // Step doesn't exist anymore
    return { id: id, flow: null }
  }

  try {
    if (step.flow) {
      const flow = await getFlowById(step.flow, userId)
      if (flow) {
        flow.steps = flow.steps.filter(stepId => stepId !== step.id)
        await updateFlow(flow)
        await regenerateFlowStepsPositions(flow)
      }
    }
  } catch (err) {
    return Promise.reject(err)
  }

  return dbSteps.deleteStep(id).then(() => ({
    id: id,
    // NB after deleting the step from the DB, GraphQL won't be able to retrieve
    // the related flow entity anymore. Hence we manually include it in the
    // response so the client will be able to e.g. request the current
    // flow.draft state within the deleteStep mutation.
    flow: step.flow || null
  }))
}
