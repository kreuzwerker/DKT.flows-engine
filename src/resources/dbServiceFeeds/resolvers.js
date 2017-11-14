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

export function getOrCreateFeed(flowId, url) {
  return getFeed(flowId).then((feed) => {
    if (!feed) {
      return createFeed({
        flowId: flowId,
        url: url,
        items: []
      })
    }
    return feed
  })
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
