import csvParse from 'csv-parse'
import service from '../../../../utils/service'

function parse(csv, opts) {
  return new Promise((resolve, reject) => {
    csvParse(csv, opts, (err, res) => {
      if (err) {
        return reject(err)
      }
      return resolve(res)
    })
  })
}

function parseCSV(inputData, { configParams }, logger) {
  const delimiter = configParams.get('separator')
  const columns = !!configParams.get('header')

  logger.log('Separator:', delimiter)
  logger.log('Iclude Header:', columns)

  // TODO clarify what "include header?" means for the result

  return parse(inputData, { delimiter, columns })
}

export const handler = service(parseCSV)
