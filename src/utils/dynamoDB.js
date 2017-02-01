/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import { marshalItem } from 'dynamodb-marshaler'
import settings from '../../settings'


function DynamoDB() {
  const { apiVersion } = settings.aws.dynamoDB
  const dynamoDB = new AWS.DynamoDB({ apiVersion })

  function merge(table, params = {}) {
    return Object.assign({}, params, {
      TableName: table
    })
  }

  return {
    // ---- aws sdk wrapper ----------------------------------------------------
    scan: (table, params) => dynamoDB.scan(merge(table, params)).promise(),
    query: (table, params) => dynamoDB.query(merge(table, params)).promise(),
    getItem: (table, params) => dynamoDB.getItem(merge(table, params)).promise(),
    batchGetItem: params => dynamoDB.batchGetItem(params).promise(),
    putItem: (table, params) => dynamoDB.putItem(merge(table, params)).promise(),
    updateItem: (table, params) => dynamoDB.updateItem(merge(table, params)).promise(),
    deleteItem: (table, params) => dynamoDB.deleteItem(merge(table, params)).promise(),

    // ---- helper -------------------------------------------------------------
    buildUpdateParams: (params, attributes, returnConsumedCapacity = 'TOTAL') => {
      const marshal = key => marshalItem({ [key]: attributes[key] })
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

      Object.keys(attributes).forEach((key) => {
        if (key === 'id') return
        updatedParams.ExpressionAttributeNames[`#${key}`] = key
        updatedParams.ExpressionAttributeValues[`:${key}`] = marshal(key)[key]
        updatedParams.UpdateExpression = `${updatedParams.UpdateExpression}, #${key} = :${key}`
      })

      return updatedParams
    }
  }
}


export default DynamoDB()
