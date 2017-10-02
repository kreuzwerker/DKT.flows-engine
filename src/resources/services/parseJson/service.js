const { PARSE_JSON_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Parses a given JSON string or object and returns a JSON object for the given path',
  icon: 'insert_drive_file',
  id: 'ciy0jfkvuahth0133z9r38yui',
  logicalResourceId: PARSE_JSON_FUNCTION,
  name: 'Parse JSON',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  configSchema: [
    {
      fieldId: 'path',
      position: 0,
      label: 'JSON Path',
      defaultValue: '$',
      type: 'input'
    }
  ],
  samplePayload: {
    'json': '{"person": {"firstName": "John", "lastName": "Doe"}}',
    'path': '$.person.firstName'
  },
  arn: arn
})
