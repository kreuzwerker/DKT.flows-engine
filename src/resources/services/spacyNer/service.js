const { SPACY_NER_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Named Entity Recognition with spacy',
  icon: 'rss_feed',
  id: 'DTFARUqXHqbLasX3qnee',
  logicalResourceId: SPACY_NER_FUNCTION,
  name: 'Spacy NER Service',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  inputType: 'string',
  outputType: 'annotations',
  configSchema: null,
  samplePayload: 'Apple is looking at buying U.K. startup for $1 billion',
  arn: arn
})
