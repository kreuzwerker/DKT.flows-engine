import feedparser from 'feedparser-promised'
import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'
import * as dbServiceFeeds from '../../../dbServiceFeeds/resolvers'
import * as dbFlowRuns from '../../../dbFlowRuns/resolvers'

function getFeedIdType(items) {
  if (items[0].guid) {
    return 'guid'
  } else if (items[0].id) {
    return 'id'
  } else if (items[0].url) {
    return 'url'
  }
  return false
}

/*
 * Check for new items in given feed
 */
function getNewFeedItems(params, logger) {
  const { flowId, url } = params

  return Promise.all([feedparser.parse(url), dbServiceFeeds.getOrCreateFeed(flowId, url)]).then((res) => {
    const [feedItems, feed] = res
    const idType = getFeedIdType(feedItems)
    if (!idType) {
      return Promise.reject(new Error('Error detecting the unique feed item identifier.'))
    }

    const newItems = feedItems.filter(feedItem => !feed.items.includes(feedItem[idType]))
    const itemIds = feedItems.map(item => item[idType])

    return dbServiceFeeds
      .updateFeed(flowId, {
        url: url,
        items: itemIds
      })
      .then(() => newItems)
  })
}

export async function handler(event, context, callback) {
  console.log('newItemInFeed', event)
  event.verbose = true
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event

  console.log(JSON.stringify(input, null, 2))

  const url = input.configParams.reduce((a, param) => {
    return param.fieldId === 'url' ? param.value : a
  }, '')

  function err(error) {
    const result = Object.assign({}, input, { error })
    logger.log('Error:', error)
    callback(null, result)
  }

  let items = []
  try {
    items = await getNewFeedItems({ flowRunId: input.flowRun.id, url: url }, logger)
  } catch (error) {
    err(error)
    return
  }

  logger.log('DEBUG feed items', items)
  if (!items.length) {
    const msg = 'No new feed items to process.'
    logger.log(msg)

    try {
      const result = await dbFlowRuns.updateFlowRun({
        id: input.flowRun.id,
        status: 'success',
        message: msg
      })

      logger.log(`Trigger FlowRun '${input.flowRun.id}'`)
      callback(null, result)
      return
    } catch (error) {
      err(error)
      return
    }
  }

  logger.log(`Trigger FlowRun '${input.flowRun.id}'`)
  try {
    if (!items[0].url) {
      err('Feed item has no URL property.')
      return
    }

    const result = await triggerFlowRun(input.flowRun, items[0].url)
    logger.log(`Triggered FlowRun with URL ${items[0].url}`, result)
    callback(null, result)
  } catch (error) {
    err(error)
  }
}

// Test function locally
process.env.DYNAMO_SERVICE_FEEDS = 'DKT-flow-engine-Dev-DynamoDBServiceFeeds-1FLY1RDH4BGRD'
getNewFeedItems(
  {
    flowId: '1',
    url: 'https://news.ycombinator.com/rss'
  },
  console
)
  .then((res) => {
    // console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })
