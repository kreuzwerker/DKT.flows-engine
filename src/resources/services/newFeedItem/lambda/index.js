import feedparser from 'feedparser-promised'
import _isString from 'lodash/isString'
import service from '../../../../utils/service'
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

function triggerStepReducer(a, step) {
  return step.service.type === 'TRIGGER' ? step : a
}

/*
 * Check for new items in given feed
 */
export async function getNewFeedItems(params, logger) {
  const flowId = params.flowId
  const url = params.url

  const newItems = []
  let feedItems = [],
      feed = null,
      itemIds = []

  // Fetch feed items
  try {
    feedItems = await feedparser.parse(url)
  } catch (err) {
    logger.log('Error fetching the feed', err)
    throw new Error(err)
  }

  // Get feed items from cache
  try {
    feed = await dbServiceFeeds.getOrCreateFeed(flowId, url)
  } catch (err) {
    logger.log('Error getting/creating the feed db entry', err)
    throw new Error(err)
  }

  if (feedItems.length) {
    // Detect id type
    const idType = getFeedIdType(feedItems)
    if (!idType) {
      throw new Error('Error detecting the unique feed item identifier.')
    }

    // Detect new items
    feedItems.forEach((item) => {
      if (!feed.items.includes(item[idType])) {
        newItems.push(item)
      }
    })

    itemIds = feedItems.map(item => item[idType])
  }

  // Update feed cache
  try {
    await dbServiceFeeds.updateFeed(flowId, {
      url: url,
      items: itemIds
    })
  } catch (err) {
    logger.log('Error fetching the feed', err)
    throw new Error(err)
  }

  return newItems
}

export async function handler(event, context, callback) {
  console.log('newItemInFeed', event)
  event.verbose = true
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event

  const steps = input.flowRun.flow.steps || []
  const currentStep = steps.reduce(triggerStepReducer, {})
  const flowId = input.flowRun.flow.id

  const url = currentStep.configParams.reduce((a, param) => {
    return param.fieldId === 'url' ? param.value : a
  }, '')

  function err(error) {
    const result = Object.assign({}, input, { error })
    logger.log('Error:', error)
    callback(null, result)
  }

  let items = []
  try {
    items = await getNewFeedItems({ flowId: flowId, url: url })
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
// process.env.DYNAMO_SERVICE_FEEDS = 'DKT-flow-engine-Test-DynamoDBServiceFeeds-ABC123456789'
// getNewFeedItems({
//   'flowId': '1',
//   'url': 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
// }, logger).then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log(err);
// })
