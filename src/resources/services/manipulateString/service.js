const { MANIPULATE_STRING_FUNCTION } = require('../../logicalResourceIds')

module.exports = arn => ({
  description: 'Manipulate String',
  icon: 'insert_drive_file',
  id: 'QvTv9lsZcWpo425eQfiHYnPN',
  logicalResourceId: MANIPULATE_STRING_FUNCTION,
  name: 'Manipulate String',
  provider: 'xOMFBmrwQmul4MB8FnEH3Z1b',
  type: 'ACTION',
  inputType: 'string',
  outputType: 'string',
  scheduled: null,
  configSchema: [
    {
      fieldId: 'camelCase',
      position: 1,
      label: 'CamelCase',
      description: 'Convert string to camelcase',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'upperCase',
      position: 2,
      label: 'UpperCase',
      description: 'Convert string to uppercase',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'capitalize',
      position: 3,
      label: 'Capitalize',
      description:
        'Convert the first character of string to upper case and the remaining to lower case',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'deburr',
      position: 4,
      label: 'Deburr',
      description:
        'Deburr string by converting Latin-1 Supplement and Latin Extended-A letters to basic Latin letters and removing combining diacritical marks',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'escape',
      position: 5,
      label: 'Escape HTML',
      description:
        'Convert the characters "&", "<", ">", \'"\', and "\'" in string to their corresponding HTML entities',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'unescape',
      position: 6,
      label: 'Unescape HTML',
      description:
        'Convert HTML entities &amp;, &lt;, &gt;, &quot;, and "&#39;" in string to their corresponding characters',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'kebabCase',
      position: 7,
      label: 'Kebabcase',
      description: 'Convert string to kebab-case',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'lowerCase',
      position: 8,
      label: 'Lowercase',
      description: 'Convert string, as space separated words, to lower case',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      fieldId: 'startCase',
      position: 9,
      label: 'Startcase',
      description: 'Converts the first character of string to lower case',
      type: 'checkbox',
      defaultValue: false,
      required: true
    }
  ],
  samplePayload:
    'Lorem ipsum dolor sit amet consectetur adipiscing elit tollitur beneficium tollitur gratia quae sunt vincla concordiae quod quidem iam fit etiam in academia cur tantas.',
  arn: arn
})
