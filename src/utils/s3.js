/*
 * S3 Utitlity which can be used in lambda functions
 */

import AWS from 'aws-sdk'
import settings from '../../settings'


class S3 {
  constructor(opts = {}) {
    this._apiVersion = opts.apiVersion || settings.aws.s3.apiVersion
    this.bucket = opts.bucket || settings.aws.s3.bucket
    this.s3 = new AWS.S3({ apiVersion: this._apiVersion })
  }


  getObject(params) {
    return this.s3.getObject(Object.assign({}, params, {
      Bucket: this.bucket
    })).promise()
  }


  putObject(params) {
    if (!this.outputBucket) return Promise.reject('[S3] Undefined Output Bucket')

    return this.s3.putObject(Object.assign({}, params, {
      Bucket: this.bucket
    })).promise()
  }
}


export default S3
