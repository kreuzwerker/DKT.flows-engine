import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _isNaN from 'lodash/isNaN'
import service from '../../../../utils/service'

function conditionalContinuation(inputData, { configParams }) {
  const conditionType = configParams.get('conditionType')
  const conditionDefinition = configParams.get('conditionDefinition')
  let condition = false
  switch (conditionDefinition) {
    case 'string': {
      condition = conditionType === 'if' ? _isString(inputData) : !_isString(inputData)
      break
    }
    case 'number': {
      const num = Number(inputData)
      condition = conditionType === 'if' ? !_isNaN(num) : _isNaN(num)
      break
    }
    case 'date': {
      const isNumber = !_isNaN(Number(inputData))
      const isDate = !_isNaN(Date.parse(inputData))

      if (isNumber) {
        condition = conditionType === 'unless'
      } else {
        condition = conditionType === 'if' ? isDate : !isDate
      }
      break
    }
    default:
  }

  if (condition) {
    return Promise.resolve(inputData)
  }

  return Promise.resolve([inputData, 'aborted'])
}

export const handler = service(conditionalContinuation)

/**
 * TEST
 */
// testData
// const testString =
//   'Lorem ipsum dolor sit amet consectetur adipiscing elit an eum discere ea mavis quae cum plane perdidiceriti nihil sciat ille.'
// const testDate = '2017-12-04T10:17:26.399Z'
// const testNumber = '1234'
// // step configuration
// const configParams = [
//   {
//     fieldId: 'conditionType',
//     value: 'unless'
//   },
//   {
//     fieldId: 'conditionDefinition',
//     value: 'number'
//   }
// ]
// configParams.get = selector => configParams.find(param => param.fieldId === selector).value
// // print result
//
// conditionalContinuation(testNumber, { configParams })
//   .then(res => console.log(res))
//   .catch(err => console.log(err))
