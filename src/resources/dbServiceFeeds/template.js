const { DYN_DB_SERVICE_FEEDS } = require('../locicalResourceIds')

module.exports = () => ({
  [DYN_DB_SERVICE_FEEDS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'flowId',
      Type: 'String'
    }
  }
})
