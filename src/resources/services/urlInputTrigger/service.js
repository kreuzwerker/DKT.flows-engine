const { URL_CONFIG_TRIGGER_SERVICE_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Triggers a flow run with a given url',
  icon: 'mail',
  id: 'ciy0jeruzbb5m01790ymkz7xl',
  name: 'Manual URL Trigger',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  logicalResourceId: URL_CONFIG_TRIGGER_SERVICE_FUNCTION,
  arn: arn,
  type: 'TRIGGER',
  inputType: 'url',
  outputType: 'url',
  scheduled: false,
  requiredAccountType: null,
  configSchema: [
    {
      position: 0,
      fieldId: 'https-checkbox',
      label: 'HTTPS',
      type: 'checkbox',
      defaultValue: true,
      required: true
    },
    {
      fieldId: 'url-input',
      position: 1,
      label: 'URL',
      defaultValue: '',
      type: 'input',
      required: true
    },
    {
      position: 3,
      fieldId: 'comment-textarea',
      label: 'Comment',
      type: 'textarea',
      defaultValue: '',
      required: false
    },
    {
      fieldId: 'method-input',
      position: 2,
      label: 'Method',
      defaultValue: 'GET',
      type: 'select',
      options: [{ label: 'GET', value: 'GET' }, { label: 'PUT', value: 'PUT' }]
    }
  ],
  samplePayload: null
})
