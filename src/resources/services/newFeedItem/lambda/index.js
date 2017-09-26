import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'
import * as dbServiceFeeds from '../../../dbServiceFeeds/resolvers'

const feedparser = require('feedparser-promised');

/*
 * Check for new items in given feed
 */
async function getNewFeedItems(params, logger) {
  const flowId = params.flowId;
  const url    = params.url;
  const idType = params.idType;
  
  let newItems = [], feedItems = [];

  // Fetch feed items
  try {
    feedItems = await feedparser.parse(url);
  } catch (err) {
    logger.log('Error fetching the feed', err);
    throw new Error(err);
  }

  // Get feed items from cache
  let feed = await dbServiceFeeds.getFeedByFLowId(flowId);

  // Detect new items
  feedItems.forEach((item) => {
    if (!feed.items.includes(item[idType])) {
      newItems.push(item);
    }
  });

  // Update feed cache
  try {
    dbServiceFeeds.updateFeed(flowId, {
      url: url,
      items: feedItems.map(item => item[idType])
    });
  } catch (err) {
    logger.log('Error fetching the feed', err);
    throw new Error(err);
  }

  return newItems;
}

function triggerStepReducer(a, step) {
  return step.service.type === 'TRIGGER' ? step : a
}

function urlValueReducer(a, param) {
  return param.fieldId === 'url-input' ? param.value : a
}

export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  const steps = input.flowRun.flow.steps || []
  const currentStep = steps.reduce(triggerStepReducer, {})
  const url = currentStep.configParams.reduce(urlValueReducer, '')

  // TODO
  console.log('DEBUG input', input);
  const flowId = '1';
  // TODO take from configParams
  const idType = 'guid';

  let items = getNewFeedItems({flowId: flowId, url: url, idType: idType});
  if (items.length == 0) {
    const result = Object.assign({}, input, { message: 'No new feed items.' });
    callback(null, result);
    return;
  }

  logger.log(`Trigger FlowRun '${input.flowRun.id}' with items: ${items}`)

  try {
    const result = await triggerFlowRun(input.flowRun, url)
    logger.log('Triggered FlowRun')
    callback(null, result)
  } catch (err) {
    const result = Object.assign({}, input, { error: err })
    logger.log('Error:', err)
    callback(null, result)
  }
}

// Test function locally
// getNewFeedItems({
//   'flowId': '1',
//   'url': 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
//   'idType': 'guid'
// }, console).then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log(err);
// })
