const AWS = require('aws-sdk')
const settings = require('../../settings')


/**
 * AWS SDK Base Factory simplify global AWS configurations
 */
function aws() {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: settings.aws.credentials.profile
  })

  return AWS
}


module.exports = aws()
