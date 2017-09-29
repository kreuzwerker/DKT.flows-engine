const { DYN_DB_FLOW_RUNS } = require('../logicalResourceIds')

module.exports = () => ({
  [DYN_DB_FLOW_RUNS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
