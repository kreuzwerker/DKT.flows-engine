const { APPROVE_TASK_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Manual Approve Task',
  icon: 'rss_feed',
  id: 'ciy0jfkvjfmbh0133z9rkg83',
  logicalResourceId: APPROVE_TASK_FUNCTION,
  name: 'Approve Task',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  task: true,
  configSchema: [
    {
      fieldId: 'title',
      position: 0,
      label: 'Title',
      defaultValue: '[FIXME no empty default values possibile]',
      type: 'input',
      required: true
    },
    {
      position: 1,
      fieldId: 'description',
      label: 'Description',
      type: 'textarea',
      defaultValue: '[FIXME no empty default values possibile]',
      required: true
    }
  ],
  samplePayload: null,
  arn: arn
})
