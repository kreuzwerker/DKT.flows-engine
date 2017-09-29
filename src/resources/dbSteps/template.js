const { DYN_DB_STEPS } = require('../logicalResourceIds')

module.exports = () => ({
  [DYN_DB_STEPS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
