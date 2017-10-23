/**
 * NOTE: THIS IS ONLY A SMALL HELPER FUNCTION TO PROVIDE SOME DATA
 *       * DO NOT USE IN TESTS OR PRODUCTION *
 *
 * TODO: This should be part of the deployment
 */
const AWS = require('aws-sdk')
const _flatten = require('lodash/flatten')
const settings = require('../../settings')
const flows = require('./data/flows.json')
const providers = require('./data/providers.json')
const steps = require('./data/steps.json')

// change table names depending on your stack
const DYNAMO_FLOWS_TABLE = 'DKT-flow-engine-Test-DynamoDBFlows-1VLWJ5E7JM9T0'
const DYNAMO_PROVIDERS_TABLE = 'DKT-flow-engine-Test-DynamoDBProviders-6UD13CDNTONI'
const DYNAMO_STEPS_TABLE = 'DKT-flow-engine-Test-DynamoDBSteps-9LFCAR2Q3GTI'

// const DYNAMO_FLOWS_TABLE = 'DKT-flow-engine-Dev-DynamoDBFlows-SBA5FMVQ4TWQ'
// const DYNAMO_PROVIDERS_TABLE = 'DKT-flow-engine-Dev-DynamoDBProviders-J2CXKJK3TOIW'
// const DYNAMO_SERVICES_TABLE = 'DKT-flow-engine-Dev-DynamoDBServices-XZN4XY9Z25VH'
// const DYNAMO_STEPS_TABLE = 'DKT-flow-engine-Dev-DynamoDBSteps-P4IK5Y04R5A0'

const { apiVersion } = settings.aws.dynamoDB
const dynamoDB = new AWS.DynamoDB(settings.aws.dynamoDB)
const documentClient = new AWS.DynamoDB.DocumentClient({ service: dynamoDB })

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
    Item: newItem,
    ReturnConsumedCapacity: 'TOTAL'
  }

  return documentClient.put(merge(table, params)).promise()
}

function seedTestdata() {
  const seedFlows = flows.map(flow => putItem(DYNAMO_FLOWS_TABLE, flow))
  const seedProviders = providers.map(provider => putItem(DYNAMO_PROVIDERS_TABLE, provider))
  const seedSteps = steps.map(step => putItem(DYNAMO_STEPS_TABLE, step))

  return Promise.all(_flatten([seedFlows, seedProviders, seedSteps]))
}

seedTestdata()
  .then(res => console.log(res))
  .catch(err => console.log(err))
