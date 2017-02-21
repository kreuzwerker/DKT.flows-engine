/**
 * NOTE: THIS IS ONLY A SMALL HELPER FUNCTION TO PROVIDE SOME DATA
 *       * DO NOT USE IN TESTS OR PRODUCTION *
 *
 * TODO: This should be part of the deployment
 */
const AWS = require('aws-sdk')
const { marshalItem } = require('dynamodb-marshaler')
const _flatten = require('lodash/flatten')
const settings = require('../../settings')
const flows = require('./data/flows.json')
const providers = require('./data/providers.json')
const services = require('./data/services.json')
const steps = require('./data/steps.json')


// change table names depending on your stack
const DYNAMO_FLOWS_TABLE = 'DKT-flow-engine-Dev-GraphQLDynamoFlows-1HI7ROOSV98PD'
const DYNAMO_PROVIDERS_TABLE = 'DKT-flow-engine-Dev-GraphQLDynamoProviders-11ZCBN9RZQ4P'
const DYNAMO_SERVICES_TABLE = 'DKT-flow-engine-Dev-GraphQLDynamoServices-LIIS5VW94F1K'
const DYNAMO_STEPS_TABLE = 'DKT-flow-engine-Dev-GraphQLDynamoSteps-KB69RMVURTJS'


const { apiVersion } = settings.aws.dynamoDB
const dynamoDB = new AWS.DynamoDB({ apiVersion })


function merge(table, params = {}) {
  return Object.assign({}, params, { TableName: table })
}


function putItem(table, item) {
  const currentDate = new Date().toISOString()
  const newItem = Object.assign({}, item, {
    createdAt: currentDate,
    updatedAt: currentDate
  })
  const params = {
    Item: marshalItem(newItem),
    ReturnConsumedCapacity: 'TOTAL'
  }

  return dynamoDB.putItem(merge(table, params)).promise()
}


function seedTestdata() {
  const seedFlows = flows.map(flow => putItem(DYNAMO_FLOWS_TABLE, flow))
  const seedProviders = providers.map(provider => putItem(DYNAMO_PROVIDERS_TABLE, provider))
  const seedServices = services.map(service => putItem(DYNAMO_SERVICES_TABLE, service))
  const seedSteps = steps.map(step => putItem(DYNAMO_STEPS_TABLE, step))

  return Promise.all(_flatten([seedFlows, seedProviders, seedServices, seedSteps]))
}


seedTestdata()
  .then(res => console.log(res))
  .catch(err => console.log(err))
