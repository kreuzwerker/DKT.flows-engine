import { DynamoDB } from '../../utils/aws'

export function getFeed(flowId) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId: flowId }
  }

  return DynamoDB.getItem(table, query).then(res => res.Item || null)
}

export function createFeed(feed) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  return DynamoDB.putItem(table, feed, 'flowId')
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
    Key: { flowId: flowId }
  }

  return DynamoDB.updateItem(table, query, feed, 'flowId')
}

export function deleteFeed(flowId) {
  const table = process.env.DYNAMO_SERVICE_FEEDS
  const query = {
    Key: { flowId }
  }
  return DynamoDB.deleteItem(table, query).then(() => ({ flowId }))
}
