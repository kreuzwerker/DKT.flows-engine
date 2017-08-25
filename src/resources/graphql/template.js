const settings = require('../../../settings')
const {
  GRAPHQL_FUNCTION,
  GRAPHQL_API_GATEWAY,
  GRAPHQL_PERMISSIONS,
  DYN_DB_FLOWS,
  DYN_DB_FLOW_RUNS,
  DYN_DB_PROVIDERS,
  DYN_DB_SERVICES,
  DYN_DB_TASKS,
  DYN_DB_STEPS,
  TASK_HANDLER_FUNCTION,
  STATE_MACHINE_TRIGGER_FUNCTION,
  STATE_MACHINE_OUTPUT_FUNCTION,
  URL_CONFIG_TRIGGER_SERVICE_FUNCTION,
  S3_BUCKET
} = require('../locicalResourceIds')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ stage, key, swaggerKey }) => ({
  [GRAPHQL_API_GATEWAY]: {
    Type: 'AWS::Serverless::Api',
    Properties: {
      DefinitionUri: `s3://${settings.aws.s3.bucket}/${swaggerKey}`,
      StageName: stage,
      Variables: {
        LambdaFunctionName: {
          Ref: GRAPHQL_FUNCTION
        }
      }
    }
  },
  [GRAPHQL_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          DYNAMO_FLOWS: { Ref: DYN_DB_FLOWS },
          DYNAMO_FLOW_RUNS: { Ref: DYN_DB_FLOW_RUNS },
          DYNAMO_PROVIDERS: { Ref: DYN_DB_PROVIDERS },
          DYNAMO_SERVICES: { Ref: DYN_DB_SERVICES },
          DYNAMO_TASKS: { Ref: DYN_DB_TASKS },
          DYNAMO_STEPS: { Ref: DYN_DB_STEPS },
          TASK_HANDLER_FUNCTION: { Ref: TASK_HANDLER_FUNCTION },
          STATE_MACHINE_TRIGGER_FUNCTION: { Ref: STATE_MACHINE_TRIGGER_FUNCTION },
          STATE_MACHINE_OUTPUT_FUNCTION: { Ref: STATE_MACHINE_OUTPUT_FUNCTION },
          URL_CONFIG_TRIGGER_SERVICE_FUNCTION: { Ref: URL_CONFIG_TRIGGER_SERVICE_FUNCTION },
          S3_BUCKET: { Ref: S3_BUCKET }
        }
      }
    },
    Events: {
      ProxyApiRoot: {
        Type: 'Api',
        Properties: {
          RestApiId: { Ref: GRAPHQL_API_GATEWAY },
          Path: '/',
          Method: 'POST'
        }
      }
    },
    DependsOn: [
      DYN_DB_FLOWS,
      DYN_DB_FLOW_RUNS,
      DYN_DB_PROVIDERS,
      DYN_DB_SERVICES,
      DYN_DB_STEPS,
      TASK_HANDLER_FUNCTION,
      STATE_MACHINE_TRIGGER_FUNCTION,
      STATE_MACHINE_OUTPUT_FUNCTION,
      URL_CONFIG_TRIGGER_SERVICE_FUNCTION
    ]
  },
  [GRAPHQL_PERMISSIONS]: {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: { 'Fn::GetAtt': [GRAPHQL_FUNCTION, 'Arn'] },
      Principal: 'apigateway.amazonaws.com',
      SourceArn: {
        'Fn::Join': [
          // we need to join the arn because AWS::Serverless::Api does not support Fn::GetAtt
          '',
          [
            `arn:aws:execute-api:${settings.aws.apiGateway.region}:${settings.aws.account}:`,
            { Ref: GRAPHQL_API_GATEWAY },
            '/*/POST/'
          ]
        ]
      }
    },
    DependsOn: [GRAPHQL_FUNCTION, GRAPHQL_API_GATEWAY]
  }
})
