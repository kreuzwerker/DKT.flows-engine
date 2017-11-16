const settings = require('../../../../settings')
const {
  NEW_FEED_ITEM_FUNCTION,
  S3_BUCKET,
  STATE_MACHINE_TRIGGER_FUNCTION,
  DYN_DB_FLOW_RUNS,
  DYN_DB_SERVICE_FEEDS
} = require('../../logicalResourceIds')

module.exports = ({ key }) => ({
  [NEW_FEED_ITEM_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          DYNAMO_FLOW_RUNS: { Ref: DYN_DB_FLOW_RUNS },
          DYNAMO_SERVICE_FEEDS: { Ref: DYN_DB_SERVICE_FEEDS },
          S3_BUCKET: { Ref: S3_BUCKET },
          STATE_MACHINE_TRIGGER_FUNCTION: { Ref: STATE_MACHINE_TRIGGER_FUNCTION }
        }
      }
    },
    dependsOn: [S3_BUCKET, STATE_MACHINE_TRIGGER_FUNCTION, DYN_DB_FLOW_RUNS, DYN_DB_SERVICE_FEEDS]
  }
})
