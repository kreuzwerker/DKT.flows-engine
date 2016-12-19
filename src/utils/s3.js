/*
 * S3 Utitlity which can be used in lambda functions
 */

import AWS from 'aws-sdk'
import settings from '../../settings'


function S3() {
  const { apiVersion, bucket } = settings.aws.s3
  const s3 = new AWS.S3({ apiVersion })


  const getObject = params => s3.getObject(Object.assign({}, params, {
    Bucket: bucket
  })).promise()



  const putObject = params => s3.putObject(Object.assign({}, params, {
    Bucket: bucket
  })).promise()


  return { bucket, getObject, putObject }
}


export default S3()
