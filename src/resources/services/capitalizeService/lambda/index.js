import _isString from 'lodash/isString'
import service from '../../../../utils/service'

function capitalize(inputData, data, logger) {
  return new Promise((resolve, reject) => {
    if (!_isString(inputData)) {
      reject(new Error('Input data is not a String'))
    } else {
      logger.log('Capitalize text')
      resolve(inputData.toUpperCase())
    }
  })
}

export const handler = service(capitalize)
