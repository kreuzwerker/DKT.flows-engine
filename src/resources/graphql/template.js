const settings = require('../../../settings')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ resource, key }) => ({
  GraphQLApiGateway: {
    Type: 'AWS::Serverless::Api',
    Properties: {
      DefinitionUri: `s3://${settings.aws.s3.bucket}/resources/${resource}/swagger.json`,
      StageName: 'Dev',
      Variables: {
        LambdaFunctionName: {
          Ref: 'GraphQL'
        }
      }
    }
  },
  GraphQL: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: settings.aws.lambda.handler,
      Runtime: settings.aws.lambda.runtime,
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: settings.aws.lambda.timeout,
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
          RestApiId: {
            Ref: 'GraphQLApiGateway'
          },
          path: '/',
          method: 'POST'
        }
      }
    }
  }
})
