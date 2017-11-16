import csvtojson from 'csvtojson'
import service from '../../../../utils/service'

function serializeCSV(inputData, { configParams }, logger) {
  // TODO
  return Promise.resolve(inputData)
}

export const handler = service(serializeCSV)
