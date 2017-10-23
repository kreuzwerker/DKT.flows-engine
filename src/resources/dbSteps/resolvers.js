import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../utils/dynamoDB'

export function allSteps() {
  const table = process.env.DYNAMO_STEPS
  return dynDB.scan(table).then(r => r.Items)
}

export function getStepById(stepId) {
  const table = process.env.DYNAMO_STEPS
  const params = {
    Key: { id: stepId }
  }

  return dynDB.getItem(table, params).then(r => r.Item || null)
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

  return dynDB.batchGetItem(query).then(res => res.Responses[table].map(unmarshalItem))
}

export function createStep(step) {
  const table = process.env.DYNAMO_STEPS
  return dynDB.putItem(table, step)
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
  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
