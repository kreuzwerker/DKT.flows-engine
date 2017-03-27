import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import { getFlowById, updateFlow } from './flows'
import { getServiceById } from './services'
import dynDB from '../../../../utils/dynamoDB'
import Lambda from '../../../../utils/lambda'
import S3 from '../../../../utils/s3'
import timestamp from '../../../../utils/timestamp'
import {
  createTestStepDataParams,
  createTestStepTriggerParams
} from '../../../../utils/helpers/stepHelpers'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allSteps() {
  const table = process.env.DYNAMO_STEPS
  return dynDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
}


export function getStepById(stepId) {
  const table = process.env.DYNAMO_STEPS
  const params = {
    Key: { id: { S: stepId } }
  }

  return dynDB.getItem(table, params)
               .then(r => (r.Item ? unmarshalItem(r.Item) : null))
}


export function batchGetStepByIds(stepsIds) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    RequestItems: {
      [table]: {
        Keys: stepsIds.map(id => ({ id: { S: id } }))
      }
    }
  }

  return dynDB.batchGetItem(query)
              .then(res => res.Responses[table].map(unmarshalItem))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createStep(step) {
  const table = process.env.DYNAMO_STEPS
  // set defaults
  const newStep = Object.assign({}, {
    id: uuid.v4(),
    position: 0,
    description: null,
    flow: null,
    service: null,
    configParams: null
  }, step)

  try {
    if (newStep.flow) {
      const flow = await getFlowById(newStep.flow)
      if (flow) {
        flow.steps.push(newStep.id)
        await updateFlow(flow)
      } else {
        newStep.flow = null
      }
    }

    return dynDB.putItem(table, newStep)
  } catch (err) {
    return Promise.reject(err)
  }
}


export function updateStep(step) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    Key: { id: { S: step.id } }
  }

  return dynDB.updateItem(table, query, step)
}


export async function testStep(stepId, payload) {
  const s3 = S3(process.env.S3_BUCKET)
  try {
    const step = await getStepById(stepId)
    const service = await getServiceById(step.service)
    const runId = `${timestamp()}_${uuid.v4()}`
    const testStepData = createTestStepDataParams(stepId, runId, payload)
    const invokeParams = createTestStepTriggerParams(stepId, service.arn, runId)

    return s3.putObject(testStepData)
      .then(() => Lambda.invoke(invokeParams))
      .then((output) => {
        const parsedOutput = JSON.parse(output.Payload)
        return s3.getObject({ Key: parsedOutput.key })
      })
      .then(({ Body }) => {
        const result = Body.toString()
        let newStep = {}
        if (JSON.parse(result).status === 'error') {
          newStep = Object.assign({}, step, { tested: false })
          return updateStep(newStep)
            .then(() => Object.assign({}, newStep, { service, error: result }))
        }
        newStep = Object.assign({}, step, { tested: true })
        return updateStep(newStep)
          .then(() => Object.assign({}, newStep, { service, result }))
      })
  } catch (err) {
    return err
  }
}


export function deleteStep(id) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    Key: { id: { S: id } }
  }
  return dynDB.deleteItem(table, query)
              .then(() => ({ id }))
}
