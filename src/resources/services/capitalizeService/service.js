const { CAPITALIZE_SERVICE_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Capitalizes a given Text',
  icon: 'rss_feed',
  id: 'ciy4poibcrqth0133z4r56alz',
  logicalResourceId: CAPITALIZE_SERVICE_FUNCTION,
  name: 'Capitalize Text',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  scheduled: null,
  task: false,
  configSchema: null,
  samplePayload: 'Lorem Ipsum dolor sit amet.',
  arn: arn
})
