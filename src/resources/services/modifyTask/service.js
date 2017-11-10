const { MODIFY_TASK_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Manual Modify Task',
  icon: 'assignment',
  id: 'azWOR5NJ5uz2cj7TqJc=',
  logicalResourceId: MODIFY_TASK_FUNCTION,
  name: 'Modify Task',
  provider: 'nqY2xusB5hHLMUdFdCQ=',
  type: 'ACTION',
  scheduled: null,
  task: true,
  taskType: 'MODIFY',
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
