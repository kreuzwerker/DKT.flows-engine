const settings = require('../../../settings')
const { TASK_HANDLER_FUNCTION, S3_BUCKET, DYN_DB_FLOW_RUNS } = require('../locicalResourceIds')

module.exports = ({ key }) => ({
  [TASK_HANDLER_FUNCTION]: {
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
          DYNAMO_FLOW_RUNS: { Ref: DYN_DB_FLOW_RUNS }
        }
      }
    },
    DependsOn: [S3_BUCKET, DYN_DB_FLOW_RUNS]
  }
})
