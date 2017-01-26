const settings = require('../../../settings')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ stage, resource, key }) => ({
  GraphQLApiGateway: {
    Type: 'AWS::Serverless::Api',
    Properties: {
      DefinitionUri: `s3://${settings.aws.s3.bucket}/resources/${stage}/${resource}/swagger.json`,
      StageName: stage,
      Variables: {
        LambdaFunctionName: {
          Ref: 'GraphQLLambda'
        }
      }
    }
  },
  GraphQLLambda: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.post',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: settings.aws.s3.bucket
        }
      }
    },
    Events: {
      ProxyApiRoot: {
        Type: 'Api',
        Properties: {
          RestApiId: { Ref: 'GraphQLApiGateway' },
          Path: '/',
          Method: 'post'
        }
      }
    }
  },
  GraphQLPermissions: {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: { 'Fn::GetAtt': ['GraphQLLambda', 'Arn'] },
      Principal: 'apigateway.amazonaws.com',
      SourceArn: {
        'Fn::Join': [ // we need to join the arn because AWS::Serverless::Api does not support Fn::GetAtt
          '',
          [
            `arn:aws:execute-api:${settings.aws.apiGateway.region}:${settings.aws.account}:`,
            { Ref: 'GraphQLApiGateway' },
            '/*/POST/'
          ]
        ]
      }
    },
    DependsOn: ['GraphQLLambda', 'GraphQLApiGateway']
  }
})
