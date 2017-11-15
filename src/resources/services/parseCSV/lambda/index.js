import csvParse from 'csv-parse'
import service from '../../../../utils/service'

  // TODO
function parseCSV(inputData, { configParams }, logger) {
  const separator = configParams.get('separator')
  const includeHeader = configParams.get('header')

  logger.log('separator:', separator)
  logger.log('includeHeader:', includeHeader)

  return Promise.resolve(inputData)
}

export const handler = service(parseCSV)
