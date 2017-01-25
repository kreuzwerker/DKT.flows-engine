const settings = require('../../../settings')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ stage, resource, key }) => ({
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
          Method: 'POST'
        }
      }
    }
  },
  GraphQLApiGateway: {
    Type: 'AWS::Serverless::Api',
    Properties: {
      DefinitionUri: `s3://${settings.aws.s3.bucket}/resources/${resource}/swagger.json`,
      StageName: stage,
      Variables: {
        LambdaFunctionName: {
          Ref: 'GraphQLLambda'
        }
      }
    }
  }
})
