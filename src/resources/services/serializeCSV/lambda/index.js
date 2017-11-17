import { json2csv } from 'json-2-csv'
import service from '../../../../utils/service'

function parse(json, opts = {}) {
  return new Promise((resolve, reject) => {
    json2csv(
      json,
      (err, csv) => {
        if (err) {
          return reject(err)
        }
        return resolve(csv)
      },
      opts
    )
  })
}

function parseBoolean(val) {
  if (typeof val === 'boolean') return val
  return val === 'true'
}

function serializeCSV(inputData, { configParams }, logger) {
  const delimiter = configParams.get('separator')
  const prependHeader = parseBoolean(configParams.get('header'))

  logger.log('Delimiter:', delimiter)
  logger.log('Prepend Header:', prependHeader)

  logger.log(inputData)

  return parse(JSON.parse(inputData), {
    delimiter: {
      field: delimiter
    },
    prependHeader
  })
    .then((res) => {
      logger.log(res)
      return res
    })
    .catch((err) => {
      logger.log(err)
      return Promise.reject(err)
    })
}

export const handler = service(serializeCSV)
