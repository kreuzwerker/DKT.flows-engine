const { DYN_DB_TASKS } = require('../logicalResourceIds')

module.exports = () => ({
  [DYN_DB_TASKS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
