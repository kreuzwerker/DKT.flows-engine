import { unmarshalItem } from 'dynamodb-marshaler'
import uuid from 'uuid'
import dynDB from '../../../../utils/dynamoDB'


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
              .then(r => unmarshalItem(r.Item))
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
export function createStep(step) {
  const table = process.env.DYNAMO_STEPS
  // set defaults
  const newStep = Object.assign({}, {
    id: uuid.v1(),
    position: 0,
    description: null,
    flow: null,
    service: null
  }, step)

  return dynDB.putItem(table, newStep)
}


export function updateStep(step) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    Key: { id: { S: step.id } }
  }

  return dynDB.updateItem(table, query, step)
}


export function deleteStep(id) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    Key: { id: { S: id } }
  }
  return dynDB.deleteItem(table, query)
              .then(() => ({ id }))
}
