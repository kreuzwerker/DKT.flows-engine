const { SERIALIZE_CSV_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Serializes CSV formatted content payload from JSON.',
  icon: 'insert_drive_file',
  id: 'wycad4oKuXv6lOdtIoaNuc2b',
  logicalResourceId: SERIALIZE_CSV_FUNCTION,
  name: 'Serialize CSV',
  provider: 'xOMFBmrwQmul4MB8FnEH3Z1b',
  type: 'ACTION',
  inputType: 'json',
  outputType: 'csv',
  scheduled: null,
  configSchema: [],
  samplePayload:
    '[{ "Year": "1997", "Make": "Ford", "Model": "E350" },\n{ "Year": "2000", "Make": "Mercury", "Model": "Cougar" }]',
  arn: arn
})
