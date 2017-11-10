const { EXTRACT_ARTICLE_TEXT_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Extracts the Article from a given HTML',
  icon: 'rss_feed',
  id: 'ciy2jfkvufdsef0864z9r38opw',
  logicalResourceId: EXTRACT_ARTICLE_TEXT_FUNCTION,
  name: 'Extract Article',
  provider: 'ciy0ivuazabar0133xu1vlvyj',
  type: 'ACTION',
  inputType: 'html',
  outputType: 'string',
  scheduled: null,
  task: false,
  configSchema: [
    {
      fieldId: 'language-input',
      position: 0,
      label: 'Language',
      defaultValue: 'en',
      type: 'radio',
      options: [{ label: 'English', value: 'en' }, { label: 'German', value: 'de' }]
    }
  ],
  samplePayload: '<html><head></head><body><article>Lorem Ipsum</article></body></html>',
  arn: arn
})
