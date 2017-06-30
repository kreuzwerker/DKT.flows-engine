const { DYN_DB_PROVIDERS } = require('../locicalResourceIds')

module.exports = () => ({
  [DYN_DB_PROVIDERS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
