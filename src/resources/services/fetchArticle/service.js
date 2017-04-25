const { FETCH_ARTICLE_FUNCTION } = require('../../locicalResourceIds')

module.exports = arn => ({
  description: 'Fetches an Article form a given url',
  icon: 'rss_feed',
  id: 'ciy0jfkvuahth0133z9r38ljg',
  locicalResourceId: FETCH_ARTICLE_FUNCTION,
  name: 'Fetch Article',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  configSchema: null,
  samplePayload: 'http://www.spiegel.de/politik/ausland/brexit-schotten-sollen-ueber-unabhaengigkeit-abstimmen-a-1138530.html',
  arn: arn
})
