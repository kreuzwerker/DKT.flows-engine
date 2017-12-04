const { DYN_DB_ACCOUNTS } = require('../logicalResourceIds')

module.exports = () => ({
  [DYN_DB_ACCOUNTS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
