const settings = require('../../../../settings')
const { ONLY_CONTINUE_IF_FUNCTION, S3_BUCKET } = require('../../logicalResourceIds')

module.exports = ({ key }) => ({
  [ONLY_CONTINUE_IF_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: { Ref: S3_BUCKET }
        }
      }
    },
    DependsOn: [S3_BUCKET]
  }
})
