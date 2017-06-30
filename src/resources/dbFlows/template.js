const { DYN_DB_FLOWS } = require('../locicalResourceIds')

module.exports = () => ({
  [DYN_DB_FLOWS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
