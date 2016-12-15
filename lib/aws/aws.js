const AWS = require('aws-sdk')
const settings = require('../../settings')


/**
 * AWS SDK Base wrapper simplify global AWS configurations
 */
class aws {
  constructor() {
    /*
     * Set AWS credentials. You should create a DKT profile within ~/.aws/credentials
     */
    AWS.config.credentials = new AWS.SharedIniFileCredentials({
      profile: settings.aws.credentials.profile
    })

    this.AWS = AWS
  }
}


module.exports = aws
