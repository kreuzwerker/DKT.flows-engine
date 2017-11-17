const { PARSE_JSON_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Parses a given JSON string or object and returns a JSON object for the given path',
  icon: 'insert_drive_file',
  id: 'ciy0jfkvuahth0133z9r38yui',
  logicalResourceId: PARSE_JSON_FUNCTION,
  name: 'Parse JSON',
  provider: 'xOMFBmrwQmul4MB8FnEH3Z1b',
  type: 'ACTION',
  inputType: 'json',
  outputType: 'json',
  scheduled: null,
  configSchema: [
    {
      fieldId: 'path',
      position: 0,
      label: 'JSON Path',
      defaultValue: '$',
      type: 'input'
    }
  ],
  samplePayload:
    '{"store":{"book":[{"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95},{"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99},{"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99},{"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}],"bicycle":{"color":"red","price":19.95}}}',
  arn: arn
})
