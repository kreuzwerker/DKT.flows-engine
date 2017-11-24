import feedparser from 'feedparser-promised'
import _isString from 'lodash/isString'
import timestamp from '../../../../utils/timestamp'
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
function getNewFeedItems(params) {
  const { flowRunId, url } = params

  return Promise.all([feedparser.parse(url), dbServiceFeeds.getOrCreateFeed(flowRunId, url)]).then((res) => {
    const [feedItems, feed] = res
    const idType = getFeedIdType(feedItems)

    if (!idType) {
      return Promise.reject(new Error('Error detecting the unique feed item identifier.'))
    }

    const newItems = feedItems.filter(feedItem => !feed.items.includes(feedItem[idType]))
    const itemIds = feedItems.map(item => item[idType])

    return dbServiceFeeds
      .updateFeed(flowRunId, {
        url: url,
        items: itemIds
      })
      .then(() => newItems)
  })
}

export function handler(event, context, callback) {
  event.verbose = true
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  const url = input.configParams.find(param => param.fieldId === 'url').value

  if (input.scheduling) {
    const { startDatetime } = input.scheduling
    const currentDatetime = new Date().toISOString

    if (new Date(startDatetime) > new Date(currentDatetime)) {
      const msg = `startDatetime ${startDatetime} is not reached yet.`
      logger.log(msg)
      callback(null, msg)
      return
    }
  }

  Promise.all([
    dbFlowRuns.getFlowRunById(input.flowRun.id),
    getNewFeedItems({ flowRunId: input.flowRun.id, url: url })
  ])
    .then(([flowRun, items]) => {
      if (items.length === 0) {
        return dbFlowRuns.updateFlowRun({
          id: input.flowRun.id,
          status: 'success',
          message: 'No new feed items to process.'
        })
      }

      return Promise.all(items.map((item) => {
        logger.log(`Trigger FlowRun with URL ${item.link}`)
        return triggerFlowRun(flowRun, item.link)
      }))
    })
    .then((res) => {
      callback(null, res)
    })
    .catch((error) => {
      const result = { ...input, error }
      logger.log('Error:', error)
      callback(null, result)
    })
}

// Test function locally
// process.env.DYNAMO_SERVICE_FEEDS = 'DKT-flow-engine-Dev-DynamoDBServiceFeeds-1FLY1RDH4BGRD'
// getNewFeedItems(
//   {
//     flowId: '1',
//     url: 'https://news.ycombinator.com/rss'
//   },
//   console
// )
//   .then((res) => {
//     // console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
