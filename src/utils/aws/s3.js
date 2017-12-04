/*
 * S3 Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import settings from '../../../settings'

function S3(bucket, credentials = null) {
  if (!bucket) {
    throw new Error('Missing bucket parameter')
  }

  const opts = credentials ? { ...settings.aws.s3, ...credentials } : settings.aws.s3

  console.log(opts)

  const s3 = new AWS.S3(opts)

  function merge(params) {
    return Object.assign({}, { Bucket: bucket }, params)
  }

  return {
    bucket,
    copyObject: params => s3.copyObject(merge(params)).promise(),
    headObject: params => s3.headObject(merge(params)).promise(),
    getObject: params => s3.getObject(merge(params)).promise(),
    putObject: params => s3.putObject(merge(params)).promise(),
    deleteObject: params => s3.deleteObject(merge(params)).promise(),
    listObjects: params => s3.listObjects(merge(params)).promise()
  }
}

export default S3
