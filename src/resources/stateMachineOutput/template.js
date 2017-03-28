const settings = require('../../../settings')
const { STATE_MACHINE_OUTPUT_FUNCTION, S3_BUCKET, DYN_DB_FLOW_RUNS } = require('../locicalResourceIds')


module.exports = ({ key }) => ({
  [STATE_MACHINE_OUTPUT_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
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
