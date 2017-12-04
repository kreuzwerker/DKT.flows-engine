const settings = require('../../../../settings')
const {
  S3_OUTPUT_SERVICE_FUNCTION,
  S3_BUCKET,
  DYN_DB_ACCOUNTS
} = require('../../logicalResourceIds')

module.exports = ({ key }) => ({
  [S3_OUTPUT_SERVICE_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: { Ref: S3_BUCKET },
          DYNAMO_ACCOUNTS: { Ref: DYN_DB_ACCOUNTS }
        }
      }
    },
    DependsOn: [S3_BUCKET]
  }
})
