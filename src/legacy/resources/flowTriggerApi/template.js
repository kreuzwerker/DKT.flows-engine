const settings = require('../../../settings')
const {
  FLOW_TRIGGER_API_FUNCTION,
  FLOW_TRIGGER_API_GATEWAY,
  FLOW_TRIGGER_API_PERMISSIONS
} = require('../locicalResourceIds')


module.exports = ({ stage, key, swaggerKey }) => ({
  [FLOW_TRIGGER_API_GATEWAY]: {
    Type: 'AWS::Serverless::Api',
    Properties: {
      DefinitionUri: `s3://${settings.aws.s3.bucket}/${swaggerKey}`,
      StageName: stage,
      Variables: {
        LambdaFunctionName: {
          Ref: FLOW_TRIGGER_API_FUNCTION
        }
      }
    }
  },
  [FLOW_TRIGGER_API_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {}
      }
    },
    Events: {
      ProxyApiRoot: {
        Type: 'Api',
        Properties: {
          RestApiId: { Ref: FLOW_TRIGGER_API_GATEWAY },
          Path: '/',
          Method: 'PUT'
        }
      }
    }
  },
  [FLOW_TRIGGER_API_PERMISSIONS]: {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: { 'Fn::GetAtt': [FLOW_TRIGGER_API_FUNCTION, 'Arn'] },
      Principal: 'apigateway.amazonaws.com',
      SourceArn: {
        'Fn::Join': [ // we need to join the arn because AWS::Serverless::Api does not support Fn::GetAtt
          '',
          [
            `arn:aws:execute-api:${settings.aws.apiGateway.region}:${settings.aws.account}:`,
            { Ref: FLOW_TRIGGER_API_GATEWAY },
            '/*/PUT/'
          ]
        ]
      }
    },
    DependsOn: [FLOW_TRIGGER_API_FUNCTION, FLOW_TRIGGER_API_GATEWAY]
  }
})
