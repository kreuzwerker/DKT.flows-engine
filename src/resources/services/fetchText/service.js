const { FETCH_TEXT_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Fetches Text form a given url',
  icon: 'rss_feed',
  id: 'ciy0jfkvuahth0133z9r38ljg',
  logicalResourceId: FETCH_TEXT_FUNCTION,
  name: 'Fetch Text',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  inputType: 'url',
  outputType: 'string',
  requiredAccountType: null,
  scheduled: null,
  configSchema: null,
  task: false,
  samplePayload:
    'http://www.spiegel.de/politik/ausland/brexit-schotten-sollen-ueber-unabhaengigkeit-abstimmen-a-1138530.html',
  arn: arn
})
