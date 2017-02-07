const settings = require('../../../settings')
const {
  GRAPHQL_FUNCTION,
  GRAPHQL_API_GATEWAY,
  GRAPHQL_PERMISSIONS,
  GRAPHQL_DB_FLOWS,
  GRAPHQL_DB_PROVIDERS,
  GRAPHQL_DB_SERVICES,
  GRAPHQL_DB_STEPS
} = require('../locicalResourceIds')


/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ stage, resource, key }) => ({
  [GRAPHQL_API_GATEWAY]: {
    Type: 'AWS::Serverless::Api',
    Properties: {
      DefinitionUri: `s3://${settings.aws.s3.bucket}/resources/${stage}/${resource}/swagger.json`,
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
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          DYNAMO_FLOWS: { Ref: GRAPHQL_DB_FLOWS },
          DYNAMO_PROVIDERS: { Ref: GRAPHQL_DB_PROVIDERS },
          DYNAMO_SERVICES: { Ref: GRAPHQL_DB_SERVICES },
          DYNAMO_STEPS: { Ref: GRAPHQL_DB_STEPS }
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
    }
  },
  [GRAPHQL_PERMISSIONS]: {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: { 'Fn::GetAtt': [GRAPHQL_FUNCTION, 'Arn'] },
      Principal: 'apigateway.amazonaws.com',
      SourceArn: {
        'Fn::Join': [ // we need to join the arn because AWS::Serverless::Api does not support Fn::GetAtt
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
  },
  [GRAPHQL_DB_FLOWS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  },
  [GRAPHQL_DB_PROVIDERS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  },
  [GRAPHQL_DB_SERVICES]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  },
  [GRAPHQL_DB_STEPS]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
