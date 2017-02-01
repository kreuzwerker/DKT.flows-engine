import { unmarshalItem, marshalItem } from 'dynamodb-marshaler'
import dynDB from '../../../../utils/dynamoDB'


/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const RootQueries = {
  allFlows: () => {
    const table = process.env.DYNAMO_FLOWS
    return dynDB.scan(table)
                .then(r => r.Items.map(unmarshalItem))
  },

  flow: (_, { id }) => {
    const table = process.env.DYNAMO_FLOWS
    const query = { Key: { id: { S: id } } }

    return dynDB.getItem(table, query)
                .then(r => unmarshalItem(r.Item))
  }
}


export function getFlowById(flowId) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: { S: flowId } }
  }

  return dynDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
}


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const currentDate = new Date().toISOString()
  const newFlow = Object.assign({}, flow, {
    createdAt: currentDate,
    updatedAt: currentDate
  })
  const params = {
    Item: marshalItem(newFlow),
    ReturnConsumedCapacity: 'TOTAL'
  }

  try {
    const { ConsumedCapacity } = await dynDB.putItem(table, params)

    if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
      throw new Error('createFlow failed. No units consumed by the operation')
    }
    return newFlow
  } catch (err) {
    return Promise.reject(err)
  }
}


export async function updateFlow(flow) {
  const table = process.env.DYNAMO_FLOWS
  const query = {
    Key: { id: { S: flow.id } }
  }

  const updateParams = dynDB.buildUpdateParams(query, flow)

  try {
    const { ConsumedCapacity } = await dynDB.updateItem(table, updateParams)

    if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
      throw new Error('createFlow failed. No units consumed by the operation')
    }

    return dynDB.getItem(table, query)
                .then(r => unmarshalItem(r.Item))
  } catch (err) {
    return Promise.reject(err)
  }
}


export function deleteFlow(flow) {
  console.log(flow)
  return Promise.resolve(flow)
}
