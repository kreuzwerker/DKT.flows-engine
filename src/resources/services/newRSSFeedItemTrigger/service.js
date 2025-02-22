const { NEW_FEED_ITEM_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Triggers on new RSS/Atom feed items',
  icon: 'rss_feed',
  id: 'ciy0jfkvuahth0133z9r38yu2',
  logicalResourceId: NEW_FEED_ITEM_FUNCTION,
  name: 'New Item in Feed',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'TRIGGER',
  inputType: 'url',
  outputType: 'html',
  requiredAccountType: null,
  scheduled: true,
  configSchema: [
    {
      fieldId: 'url',
      position: 0,
      label: 'Feed URL',
      defaultValue: '',
      type: 'input',
      required: true
    }
    // {
    //   fieldId: 'interval',
    //   position: 2,
    //   label: 'Polling interval (in minutes)',
    //   defaultValue: '15',
    //   type: 'input'
    // }
  ],
  samplePayload: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
  arn: arn
})
