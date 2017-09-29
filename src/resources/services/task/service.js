const { APPROVE_TASK_FUNCTION } = require('../../locicalResourceIds')

module.exports = arn => ({
  description: 'Manual Approve Task',
  icon: 'rss_feed',
  id: 'ciy0jfkvjfmbh0133z9rkg83',
  locicalResourceId: APPROVE_TASK_FUNCTION,
  name: 'Approve Task',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  task: true,
  configSchema: null,
  samplePayload: null,
  arn: arn
})
