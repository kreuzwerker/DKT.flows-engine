const { DYN_DB_TASKS } = require('../locicalResourceIds')

module.exports = () => ({
  [DYN_DB_TASKS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
