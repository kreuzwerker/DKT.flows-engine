const settings = require('../../../settings')
const { STATE_MACHINE_TRIGGER_FUNCTION, S3_BUCKET } = require('../locicalResourceIds')

module.exports = ({ key }) => ({
  [STATE_MACHINE_TRIGGER_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
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
