const settings = require('../../../settings')
const {
  TEST_STEP_FUNCTION,
  GRAPHQL_FUNCTION,
  DYN_DB_FLOWS,
  DYN_DB_FLOW_RUNS,
  DYN_DB_SERVICES,
  DYN_DB_PROVIDERS,
  DYN_DB_STEPS,
  S3_BUCKET
} = require('../locicalResourceIds')


/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ stage, resource, key }) => ({
  [TEST_STEP_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          DYNAMO_FLOWS: { Ref: DYN_DB_FLOWS },
          DYNAMO_FLOW_RUNS: { Ref: DYN_DB_FLOW_RUNS },
          DYNAMO_PROVIDERS: { Ref: DYN_DB_PROVIDERS },
          DYNAMO_SERVICES: { Ref: DYN_DB_SERVICES },
          DYNAMO_STEPS: { Ref: DYN_DB_STEPS },
          S3_BUCKET: { Ref: S3_BUCKET }
        }
      }
    },
    DependsOn: [
      GRAPHQL_FUNCTION,
      DYN_DB_FLOWS,
      DYN_DB_FLOW_RUNS,
      DYN_DB_STEPS,
      DYN_DB_PROVIDERS,
      DYN_DB_SERVICES
    ]
  }
})
