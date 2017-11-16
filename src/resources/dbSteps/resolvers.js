import { DynamoDB } from '../../utils/aws'

export function allSteps() {
  const table = process.env.DYNAMO_STEPS
  return DynamoDB.scan(table).then(r => r.Items)
}

export function getStepById(stepId) {
  const table = process.env.DYNAMO_STEPS
  const params = {
    Key: { id: stepId }
  }

  return DynamoDB.getItem(table, params).then(r => r.Item || null)
}

export function batchGetStepByIds(stepsIds) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    RequestItems: {
      [table]: {
        Keys: stepsIds.map(id => ({ id }))
      }
    }
  }

  return DynamoDB.batchGetItem(query).then((res) => {
    return res.Responses[table]
  })
}

export function createStep(step) {
  const table = process.env.DYNAMO_STEPS
  return DynamoDB.putItem(table, step)
}

export function updateStep(step) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    Key: { id: step.id }
  }

  return DynamoDB.updateItem(table, query, step)
}

export function deleteStep(id) {
  const table = process.env.DYNAMO_STEPS
  const query = {
    Key: { id }
  }
  return DynamoDB.deleteItem(table, query).then(() => ({ id }))
}
