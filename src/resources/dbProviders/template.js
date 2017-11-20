const { DYN_DB_PROVIDERS } = require('../logicalResourceIds')

module.exports = () => ({
  [DYN_DB_PROVIDERS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
