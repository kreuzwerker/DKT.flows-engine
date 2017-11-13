/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import settings from '../../../settings'

function DynamoDB() {
  const dynamoDB = new AWS.DynamoDB(settings.aws.dynamoDB)
  const documentClient = new AWS.DynamoDB.DocumentClient({
    service: dynamoDB,
    convertEmptyValues: true
  })

  function merge(table, params = {}) {
    return { ...params, TableName: table }
  }

  function buildUpdateParams(params, item, primaryKey = 'id', returnConsumedCapacity = 'TOTAL') {
    const updatedParams = {
      ...params,
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString()
      },
      UpdateExpression: 'SET #updatedAt = :updatedAt',
      ReturnConsumedCapacity: returnConsumedCapacity
    }

    Object.keys(item).forEach((key) => {
      if (key === primaryKey) return
      if (key === 'updatedAt') return
      if (key === 'createdAt') return
      updatedParams.ExpressionAttributeNames[`#${key}`] = key
      updatedParams.ExpressionAttributeValues[`:${key}`] = item[key]
      updatedParams.UpdateExpression = `${updatedParams.UpdateExpression}, #${key} = :${key}`
    })

    return updatedParams
  }

  return {
    scan: (table, params) => documentClient.scan(merge(table, params)).promise(),

    query: (table, params) => dynamoDB.query(merge(table, params)).promise(), // TODO we can remove this

    getItem: (table, params) => documentClient.get(merge(table, params)).promise(),

    batchGetItem: params => documentClient.batchGet(params).promise(),

    putItem: async (table, item, primaryKey = 'id') => {
      const currentDate = new Date().toISOString()
      const params = {
        Item: { ...item, createdAt: currentDate, updatedAt: currentDate },
        ReturnConsumedCapacity: 'TOTAL'
      }
      const { ConsumedCapacity } = await documentClient.put(merge(table, params)).promise()

      if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
        throw new Error('putItem failed. No units consumed by the operation')
      }

      const query = { Key: { [primaryKey]: item[primaryKey] } }

      return documentClient
        .get(merge(table, query))
        .promise()
        .then(r => r.Item)
    },

    updateItem: async (table, query, item, primaryKey = 'id') => {
      const updateParams = merge(table, buildUpdateParams(query, item, primaryKey))
      const { ConsumedCapacity } = await documentClient.update(updateParams).promise()

      if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
        throw new Error('updateItem failed. No units consumed by the operation')
      }

      return documentClient
        .get(merge(table, query))
        .promise()
        .then(res => res.Item)
    },

    deleteItem: async (table, item) => {
      const { ConsumedCapacity } = await documentClient.delete(merge(table, item)).promise()

      if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
        throw new Error('deleteItem failed. No units consumed by the operation')
      }

      return 'success'
    }
  }
}

export default DynamoDB()
