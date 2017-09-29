const settings = require('../../../settings')
const { TASK_INITIALIZER_FUNCTION, S3_BUCKET, DYN_DB_TASKS } = require('../locicalResourceIds')

module.exports = ({ key }) => ({
  [TASK_INITIALIZER_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 65,
      Environment: {
        Variables: {
          S3_BUCKET: { Ref: S3_BUCKET },
          DYNAMO_TASKS: { Ref: DYN_DB_TASKS }
        }
      }
    },
    DependsOn: [S3_BUCKET, DYN_DB_TASKS]
  }
})
