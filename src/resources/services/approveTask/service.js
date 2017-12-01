const { APPROVE_TASK_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Manual Approve Task',
  icon: 'assignment',
  id: 'ciy0jfkvjfmbh0133z9rkg83',
  logicalResourceId: APPROVE_TASK_FUNCTION,
  name: 'Approve Task',
  provider: 'nqY2xusB5hHLMUdFdCQ=',
  type: 'ACTION',
  requiredAccountType: null,
  inputType: null,
  outputType: null,
  scheduled: null,
  task: true,
  taskType: 'APPROVE',
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
