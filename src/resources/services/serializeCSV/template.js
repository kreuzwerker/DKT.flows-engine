const settings = require('../../../../settings')
const { SERIALIZE_CSV_FUNCTION, S3_BUCKET } = require('../../logicalResourceIds')

module.exports = ({ key }) => ({
  [SERIALIZE_CSV_FUNCTION]: {
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
