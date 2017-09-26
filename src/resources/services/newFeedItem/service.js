const { NEW_FEED_ITEM_FUNCTION } = require('../../locicalResourceIds')

module.exports = arn => ({
  description: 'Triggers on new RSS/Atom feed items',
  icon: 'rss_feed',
  id: 'ciy0jfkvuahth0133z9r38yu2',
  locicalResourceId: NEW_FEED_ITEM_FUNCTION,
  name: 'New Item in Feed',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'TRIGGER',
  configSchema: null,
  samplePayload: {
    'url': 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    'interval': '15'
  },
  arn: arn
})
