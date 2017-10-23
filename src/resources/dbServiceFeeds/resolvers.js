import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../utils/dynamoDB'

export async function getFeed(flowId) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: { S: flowId } }
  }
  const r = await dynDB.getItem(table, query)
  return r.Item ? unmarshalItem(r.Item) : null
}

export function createFeed(feed) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  return dynDB.putItem(table, feed, 'flowId')
}

export async function getOrCreateFeed(flowId, url) {
  // Find feed
  let feed = await getFeed(flowId)

  // Or create feed
  if (!feed) {
    feed = await createFeed({
      flowId: flowId,
      url: url,
      items: []
    })
  }

  return feed
}

export function updateFeed(flowId, feed) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: { S: flowId } }
  }

  return dynDB.updateItem(table, query, feed, 'flowId')
}

export function deleteFeed(flowId) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: { S: flowId } }
  }
  return dynDB.deleteItem(table, query).then(() => ({ flowId }))
}
