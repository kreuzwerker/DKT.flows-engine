const { S3_OUTPUT_SERVICE_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Push data to a AWS S3 Bucket',
  icon: 'rss_feed',
  id: 'cij1jqvvgagth9999z3r33aws',
  logicalResourceId: S3_OUTPUT_SERVICE_FUNCTION,
  name: 'S3 Output',
  provider: 'aws2xusB54GTFUUTERY2',
  type: 'ACTION',
  inputType: 'json',
  outputType: 'json',
  scheduled: null,
  configSchema: [
    {
      fieldId: 'bucket',
      label: 'Bucket',
      defaultValue: '',
      type: 'input',
      required: true
    },
    {
      fieldId: 'accessKey',
      label: 'Access Key',
      defaultValue: '',
      type: 'input',
      required: true
    },
    {
      fieldId: 'accessSecretKey',
      label: 'Secret Key',
      defaultValue: '',
      type: 'input',
      required: true,
      secret: true
    },
    {
      fieldId: 'path',
      label: 'Path',
      defaultValue: '',
      type: 'input',
      required: true
    },
    {
      fieldId: 'filename',
      label: 'Filename',
      defaultValue: 'S3Output',
      type: 'input',
      required: true
    }
  ],
  task: false,
  samplePayload: null,
  arn: arn
})
