const settings = require('../../../settings')
const { TASK_OUTPUT_HANDLER_FUNCTION } = require('../logicalResourceIds')

module.exports = ({ key }) => ({
  [TASK_OUTPUT_HANDLER_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {}
      }
    },
    DependsOn: []
  }
})
