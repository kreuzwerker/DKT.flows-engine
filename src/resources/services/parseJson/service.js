const { PARSE_JSON_FUNCTION } = require('../../locicalResourceIds')

module.exports = arn => ({
  description: 'Parses a JSON string and returns a JSON object for the given path',
  icon: 'insert_drive_file',
  id: 'ciy0jfkvuahth0133z9r38yui',
  locicalResourceId: PARSE_JSON_FUNCTION,
  name: 'Parse JSON',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  configSchema: null,
  samplePayload: [
    '{"person": {"firstName": "John", "lastName": "Doe"}}',
    '$.person.firstName'
  ],
  arn: arn
})
