const { ONLY_CONTINUE_IF_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Conditional continuation',
  icon: 'rss_feed',
  id: '7y4iL4vxPCCbPzRZNyv47ueZ',
  logicalResourceId: ONLY_CONTINUE_IF_FUNCTION,
  name: 'Only continue if...',
  provider: 'ciy1fjpm60oyl014323zlitjn',
  type: 'ACTION',
  inputType: 'all',
  outputType: 'all',
  scheduled: null,
  requiredAccountType: null,
  configSchema: [
    {
      fieldId: 'conditionType',
      label: 'Condition',
      defaultValue: 'if',
      type: 'select',
      options: [{ value: 'if', label: 'Is' }, { value: 'unless', label: 'Is not' }],
      required: true
    },
    {
      fieldId: 'conditionDefinition',
      label: 'Type',
      defaultValue: '',
      type: 'select',
      options: [
        { value: 'string', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'date', label: 'Date' }
      ],
      required: false
    }
  ],
  task: false,
  samplePayload: null,
  arn: arn
})
