const { PARSE_CSV_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Parses CSV formatted content payload to JSON',
  icon: 'insert_drive_file',
  id: '6CNdjnZaHtc4R3BbIIHuqBNj',
  logicalResourceId: PARSE_CSV_FUNCTION,
  name: 'Parse CSV',
  provider: 'xOMFBmrwQmul4MB8FnEH3Z1b',
  type: 'ACTION',
  inputType: 'csv',
  outputType: 'json',
  scheduled: null,
  requiredAccountType: null,
  configSchema: [
    {
      fieldId: 'separator',
      position: 0,
      label: 'Separator',
      defaultValue: ',',
      type: 'input',
      required: true
    },
    {
      fieldId: 'header',
      position: 1,
      label: 'Include Header',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'normalized',
      position: 2,
      label: 'Normalized',
      type: 'checkbox',
      defaultValue: true,
      required: true
    }
  ],
  samplePayload: 'Year,Make,Model\n1997,Ford,E350\n2000,Mercury,Cougar',
  arn: arn
})
