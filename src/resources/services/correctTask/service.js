const { CORRECT_TASK_FUNCTION } = require('../../logicalResourceIds');

module.exports = arn => ({
  description: 'Manual Correct Task',
  icon: 'assignment',
  id: 'azWOR5NJ5uz2cj7TqJc=',
  logicalResourceId: CORRECT_TASK_FUNCTION,
  name: 'Correct Task',
  provider: 'nqY2xusB5hHLMUdFdCQ=',
  type: 'ACTION',
  task: true,
  taskType: 'CORRECT',
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
});
