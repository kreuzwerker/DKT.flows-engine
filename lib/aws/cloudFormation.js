const Fs = require('fs')
const Path = require('path')
const AWS = require('./aws')
const settings = require('../../settings')


/**
 * AWS SDK Cloudformation Factory to simplify the CloudFormation deployment
 */
function CloudFormation() {
  const { apiVersion } = settings.aws.cloudFormation
  const cloudFormation = new AWS.CloudFormation({ apiVersion })


  return {
    deploy: (stage) => { console.log(stage) }
  }
}


module.exports = CloudFormation()
