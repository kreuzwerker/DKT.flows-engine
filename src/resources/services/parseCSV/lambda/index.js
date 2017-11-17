import csvtojson from 'csvtojson'
import service from '../../../../utils/service'

function parse(csv, opts) {
  const converter = csvtojson(opts)
  const arr = []

  return new Promise((resolve, reject) => {
    converter
      .fromString(csv)
      .on('csv', (row) => {
        arr.push(row)
      })
      .on('error', err => reject(err))
      .on('end_parsed', (res) => {
        resolve({
          array: arr,
          normalized: res
        })
      })
  })
}

function parseBoolean(val) {
  if (typeof val === 'boolean') return val
  return val === 'true'
}

function parseCSV(inputData, { configParams }, logger) {
  const delimiter = configParams.get('separator')
  const header = parseBoolean(configParams.get('header'))
  const normalized = parseBoolean(configParams.get('normalized'))

  logger.log('Delimiter:', delimiter)
  logger.log('Header:', header)
  logger.log('Normalized:', normalized)

  return parse(inputData, { delimiter, noheader: header, flatKeys: true })
    .then((res) => {
      if (normalized) {
        logger.log(res.normalized)
        return res.normalized
      }
      logger.log(res.array)
      return res.array
    })
    .catch((err) => {
      logger.log(err)
      return Promise.reject(err)
    })
}

export const handler = service(parseCSV)
