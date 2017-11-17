const { CAPITALIZE_SERVICE_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Capitalizes a given Text',
  icon: 'rss_feed',
  id: 'ciy4poibcrqth0133z4r56alz',
  logicalResourceId: CAPITALIZE_SERVICE_FUNCTION,
  name: 'Capitalize Text',
  provider: 'xOMFBmrwQmul4MB8FnEH3Z1b',
  type: 'ACTION',
  inputType: 'string',
  outputType: 'string',
  scheduled: null,
  task: false,
  configSchema: null,
  samplePayload: 'Lorem Ipsum dolor sit amet.',
  arn: arn
})
