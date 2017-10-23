/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import { marshalItem, unmarshalItem } from 'dynamodb-marshaler'
import settings from '../../settings'

function DynamoDB() {
  const dynamoDB = new AWS.DynamoDB(settings.aws.dynamoDB)
  const documentClient = new AWS.DynamoDB.DocumentClient({ service: dynamoDB })

  function merge(table, params = {}) {
    return { ...params, TableName: table }
  }

  function buildUpdateParams(params, item, primaryKey = 'id', returnConsumedCapacity = 'TOTAL') {
    const marshal = key => marshalItem({ [key]: item[key] })
    const updatedParams = {
      ...params,
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':updatedAt': { S: new Date().toISOString() }
      },
      UpdateExpression: 'SET #updatedAt = :updatedAt',
      ReturnConsumedCapacity: returnConsumedCapacity
    }

    Object.keys(item).forEach((key) => {
      if (key === primaryKey) return
      if (key === 'updatedAt') return
      if (key === 'createdAt') return
      updatedParams.ExpressionAttributeNames[`#${key}`] = key
      updatedParams.ExpressionAttributeValues[`:${key}`] = marshal(key)[key]
      updatedParams.UpdateExpression = `${updatedParams.UpdateExpression}, #${key} = :${key}`
    })

    return updatedParams
  }

  return {
    scan: (table, params) => dynamoDB.scan(merge(table, params)).promise(),

    query: (table, params) => dynamoDB.query(merge(table, params)).promise(),

    getItem: (table, params) => documentClient.get(merge(table, params)).promise(),

    batchGetItem: params => dynamoDB.batchGetItem(params).promise(),

    putItem: async (table, item, primaryKey = 'id') => {
      const currentDate = new Date().toISOString()
      const params = {
        Item: { ...item, createdAt: currentDate, updatedAt: currentDate },
        ReturnConsumedCapacity: 'TOTAL'
      }
      const { ConsumedCapacity } = await documentClient.putItem(merge(table, params)).promise()

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
      const { ConsumedCapacity } = await dynamoDB.updateItem(updateParams).promise()

      if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
        throw new Error('updateItem failed. No units consumed by the operation')
      }

      const updatedItem = await dynamoDB.getItem(merge(table, query)).promise()
      return unmarshalItem(updatedItem.Item)
    },

    deleteItem: async (table, item) => {
      const { ConsumedCapacity } = await dynamoDB.deleteItem(merge(table, item)).promise()

      if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
        throw new Error('deleteItem failed. No units consumed by the operation')
      }

      return 'success'
    }
  }
}

export default DynamoDB()
