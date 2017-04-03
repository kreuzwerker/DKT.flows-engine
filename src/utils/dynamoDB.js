/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import { marshalItem, unmarshalItem } from 'dynamodb-marshaler'
import settings from '../../settings'


function DynamoDB() {
  const { apiVersion } = settings.aws.dynamoDB
  const dynamoDB = new AWS.DynamoDB({ apiVersion })


  function merge(table, params = {}) {
    return Object.assign({}, params, {
      TableName: table
    })
  }


  function buildUpdateParams(params, item, returnConsumedCapacity = 'TOTAL') {
    const marshal = key => marshalItem({ [key]: item[key] })
    const updatedParams = Object.assign({}, params, {
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':updatedAt': { S: new Date().toISOString() }
      },
      UpdateExpression: 'SET #updatedAt = :updatedAt',
      ReturnConsumedCapacity: returnConsumedCapacity
    })

    Object.keys(item).forEach((key) => {
      if (key === 'id') return
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

    getItem: (table, params) => dynamoDB.getItem(merge(table, params)).promise(),

    batchGetItem: params => dynamoDB.batchGetItem(params).promise(),


    putItem: async (table, item) => {
      const currentDate = new Date().toISOString()
      const newItem = Object.assign({}, item, {
        createdAt: currentDate,
        updatedAt: currentDate
      })
      const params = {
        Item: marshalItem(newItem),
        ReturnConsumedCapacity: 'TOTAL'
      }
      const { ConsumedCapacity } = await dynamoDB.putItem(merge(table, params)).promise()

      if (ConsumedCapacity && ConsumedCapacity.CapacityUnits === 0) {
        throw new Error('putItem failed. No units consumed by the operation')
      }

      const query = { Key: { id: { S: item.id } } }
      const createdInstance = await dynamoDB.getItem(merge(table, query)).promise()

      return unmarshalItem(createdInstance.Item)
    },


    updateItem: async (table, query, item) => {
      const updateParams = merge(table, buildUpdateParams(query, item))
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
