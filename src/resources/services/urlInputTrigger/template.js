const settings = require('../../../../settings')
const {
  DYN_DB_FLOW_RUNS,
  URL_CONFIG_TRIGGER_SERVICE_FUNCTION,
  STATE_MACHINE_TRIGGER_FUNCTION,
  S3_BUCKET
} = require('../../locicalResourceIds')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key }) => ({
  [URL_CONFIG_TRIGGER_SERVICE_FUNCTION]: {
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
          STATE_MACHINE_TRIGGER_FUNCTION: { Ref: STATE_MACHINE_TRIGGER_FUNCTION },
          DYNAMO_FLOW_RUNS: { Ref: DYN_DB_FLOW_RUNS }
        }
      }
    },
    dependsOn: [DYN_DB_FLOW_RUNS, S3_BUCKET, STATE_MACHINE_TRIGGER_FUNCTION]
  }
})
