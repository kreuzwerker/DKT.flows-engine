const AWS = require('./aws')
const settings = require('../../settings')

function S3() {
  const { apiVersion, bucket } = settings.aws.s3
  const s3 = new AWS.S3({ apiVersion })

  function merge(params) {
    return Object.assign({}, { Bucket: bucket }, params)
  }

  return {
    bucket,
    getObject: params => s3.getObject(merge(params)).promise(),
    putObject: params => s3.putObject(merge(params)).promise(),
    listObjects: params => s3.listObjects(merge(params)).promise()
  }
}

module.exports = S3()
