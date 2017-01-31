import { unmarshalItem } from 'dynamodb-marshaler'
import dDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allFlows: () => {
    const table = process.env.DYNAMO_FLOWS
    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  flow: (_, { id }) => {
    const table = process.env.DYNAMO_FLOWS
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  }
}


export function getFlowById(flowId) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: { S: flowId } }
  }

  return dDB.getItem(table, query)
            .then(r => unmarshalItem(r.Item))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// TODO
