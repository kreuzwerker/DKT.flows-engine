const { NEW_FEED_ITEM_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Triggers on new RSS/Atom feed items',
  icon: 'rss_feed',
  id: 'ciy0jfkvuahth0133z9r38yu2',
  logicalResourceId: NEW_FEED_ITEM_FUNCTION,
  name: 'New Item in Feed',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'TRIGGER',
  configSchema: [
    {
      fieldId: 'url',
      position: 0,
      label: 'Feed URL',
      defaultValue: 'rss://',
      type: 'input'
    },
    {
      fieldId: 'idType',
      position: 1,
      label: 'ID type',
      defaultValue: 'guid',
      type: 'input'
    },
    {
      fieldId: 'interval',
      position: 2,
      label: 'Polling interval (in minutes)',
      defaultValue: '15',
      type: 'input'
    }
  ],
  samplePayload: {
    'url': 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    'idType': 'guid',
    'interval': '15'
  },
  arn: arn
})
