import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../utils/dynamoDB'

// TEMP
process.env.DYNAMO_SERVICE_FEEDS = 'DKT-flow-engine-Test-DynamoDBServiceFeeds-ABC123456789'

export function getFeedByFLowId(flowId) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: { S: flowId } }
  }

  return dynDB.getItem(table, query).then(r => (r.Item ? unmarshalItem(r.Item) : null))
}

export function createFeed(feed) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  return dynDB.putItem(table, feed)
}

export function updateFeed(flowId, feed) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: { S: flowId } }
  }

  return dynDB.updateItem(table, query, feed)
}

export function deleteFeed(flowId) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: { S: flowId } }
  }
  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
