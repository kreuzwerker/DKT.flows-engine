const { REVIEW_TASK_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Manual Review Task',
  icon: 'assignment',
  id: 'djk1jfkvjfmbh0123z9fri94',
  logicalResourceId: REVIEW_TASK_FUNCTION,
  name: 'Review Task',
  provider: 'nqY2xusB5hHLMUdFdCQ=',
  type: 'ACTION',
  task: true,
  taskType: 'REVIEW',
  configSchema: [
    {
      fieldId: 'title',
      position: 0,
      label: 'Title',
      defaultValue: '',
      type: 'input',
      required: true
    },
    {
      position: 1,
      fieldId: 'description',
      label: 'Description',
      type: 'textarea',
      defaultValue: '',
      required: true
    }
  ],
  samplePayload: null,
  arn: arn
})
