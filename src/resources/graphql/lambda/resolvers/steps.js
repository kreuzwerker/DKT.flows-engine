import { unmarshalItem } from 'dynamodb-marshaler'
import dDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allSteps: () => {
    const table = process.env.DYNAMO_STEPS

    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  step: (_, { id }) => {
    const table = process.env.DYNAMO_STEPS
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  }
}


export function getStepById(stepId) {
  const table = process.env.DYNAMO_STEPS
  const params = {
    Key: { id: { S: stepId } }
  }

  return dDB.getItem(table, params)
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

  return dDB.batchGetItem(query)
            .then(res => res.Responses[table].map(unmarshalItem))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// TODO
