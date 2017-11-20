import _str from 'lodash/string'
import service from '../../../../utils/service'

function parseBoolean(val) {
  if (typeof val === 'boolean') return val
  return val === 'true'
}

function manipulateSring(inputData, { configParams }) {
  let str = inputData

  configParams.forEach((param) => {
    if (parseBoolean(configParams.get(param.fieldId)) === true) {
      str = _str[param.fieldId](str)
    }
  })

  return Promise.resolve(str) // for now
}

export const handler = service(manipulateSring)

// const configParams = [
//   { fieldId: 'camelCase', value: 'true' },
//   { fieldId: 'capitalize', value: 'true' }
// ]
// configParams.get = fieldId => configParams.find(t => t.fieldId === fieldId).value
//
// manipulateSring('foobar', { configParams })
