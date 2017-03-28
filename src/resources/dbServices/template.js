const { DYN_DB_SERVICES } = require('../locicalResourceIds')


module.exports = () => ({
  [DYN_DB_SERVICES]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
