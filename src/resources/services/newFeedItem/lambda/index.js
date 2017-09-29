import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'
import * as dbServiceFeeds from '../../../dbServiceFeeds/resolvers'
import * as dbFlowRuns from '../../../dbFlowRuns/resolvers'
import feedparser from 'feedparser-promised'

/*
 * Check for new items in given feed
 */
async function getNewFeedItems(params, logger) {
  const flowId = params.flowId;
  const url    = params.url;
  const idType = params.idType;
  
  let newItems = [], feedItems = [], feed = null;

  // Fetch feed items
  try {
    feedItems = await feedparser.parse(url);
  } catch (err) {
    logger.log('Error fetching the feed', err);
    throw new Error(err);
  }

  // Get feed items from cache
  try {
    feed = await dbServiceFeeds.getOrCreateFeed(flowId, url);
  } catch (err) {
    logger.log('Error getting/creating the feed db entry', err);
    throw new Error(err);
  }

  // Detect new items
  feedItems.forEach((item) => {
    if (!feed.items.includes(item[idType])) {
      newItems.push(item);
    }
  });

  // Update feed cache
  try {
    await dbServiceFeeds.updateFeed(flowId, {
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

export async function handler(event, context, callback) {
  event.verbose = true
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  const steps = input.flowRun.flow.steps || []
  const currentStep = steps.reduce(triggerStepReducer, {})
  // TODO payload = url ?
  const payload = null;
  
  const flowId = input.flowRun.flow.id;

  console.log('DEBUG currentStep.configParams', currentStep.configParams);
  const idType = currentStep.configParams.reduce((a, param) => {
    return param.fieldId === 'idType' ? param.value : a
  }, '')
  const url = currentStep.configParams.reduce((a, param) => {
    return param.fieldId === 'url' ? param.value : a
  }, '')
  
  function err(err) {
    const result = Object.assign({}, input, { error: err });
    logger.log('Error:', err);
    callback(null, result);
  }

  let items = [];
  try {
    items = await getNewFeedItems({flowId: flowId, url: url, idType: idType});
  } catch (err) {
    err(err);
    return;
  }

  logger.log('DEBUG feed items', items);
  if (!items.length) {
    const msg = `No new feed items to process.`;
    logger.log(msg);

    try {
      const result = await dbFlowRuns.updateFlowRun({
        id: input.flowRun.id,
        status: 'success',
        message: msg
      })
  
      logger.log(`Trigger FlowRun '${input.flowRun.id}'`);
      callback(null, result);
      return;
    } catch (err) {
      err(err);
      return;
    }
  }

  logger.log(`Trigger FlowRun '${input.flowRun.id}'`)

  try {
    const params = {
      json: items[0],
      path: '$.title'
    };
    const result = await triggerFlowRun(input.flowRun, params);
    logger.log('Triggered FlowRun', result);
    callback(null, result);
  } catch (err) {
    err(err);
  }
}

// Test function locally
// process.env.DYNAMO_SERVICE_FEEDS = 'DKT-flow-engine-Test-DynamoDBServiceFeeds-ABC123456789'
// getNewFeedItems({
//   'flowId': '1',
//   'url': 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
//   'idType': 'guid'
// }, console).then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log(err);
// })
