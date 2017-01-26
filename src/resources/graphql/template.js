const settings = require('../../../settings')
const {
  GRAPHQL_FUNCTION,
  GRAPHQL_API_GATEWAY,
  GRAPHQL_PERMISSIONS,
  GRAPHQL_DB
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
      Handler: 'index.post',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: settings.aws.s3.bucket,
          DYNAMO_TABLE: { Ref: GRAPHQL_DB }
        }
      }
    },
    Events: {
      ProxyApiRoot: {
        Type: 'Api',
        Properties: {
          RestApiId: { Ref: GRAPHQL_API_GATEWAY },
          Path: '/',
          Method: 'post'
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
  [GRAPHQL_DB]: {
    Type: 'AWS::Serverless::SimpleTable',
    PrimaryKey: {
      Name: 'id',
      Type: 'String'
    }
  }
})
