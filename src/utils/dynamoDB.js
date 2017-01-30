/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
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
    scan: (table, params) => dynamoDB.scan(merge(table, params)).promise(),
    query: (table, params) => dynamoDB.query(merge(table, params)).promise(),
    getItem: (table, params) => dynamoDB.getItem(merge(table, params)).promise(),
    batchGetItem: params => dynamoDB.batchGetItem(params).promise(),
    putItem: (table, params) => dynamoDB.putItem(merge(table, params)).promise(),
    updateItem: (table, params) => dynamoDB.updateItem(merge(table, params)).promise(),
    deleteItem: (table, params) => dynamoDB.deleteItem(merge(table, params)).promise()
  }
}


export default DynamoDB()
