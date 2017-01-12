const settings = require('../../settings')

const { account, apiGateway, lambda } = settings.aws
const lambdaFunction = 'graphql'


module.exports = {
  '/graphql': {
    'post': {
      'produces': [
        'application/json'
      ],
      'responses': {
        '200': {
          'description': '200 response',
          'schema': {
            '$ref': '#/definitions/Empty'
          }
        }
      },
      'x-amazon-apigateway-integration': {
        'responses': {
          'default': {
            'statusCode': '200'
          }
        },
        'uri': `arn:aws:apigateway:${apiGateway.region}:lambda:path/${lambda.apiVersion}/functions/arn:aws:lambda:${lambda.region}:${account}:function:${lambdaFunction}/invocations`,
        'passthroughBehavior': 'when_no_match',
        'httpMethod': 'POST',
        'contentHandling': 'CONVERT_TO_TEXT',
        'type': 'aws'
      }
    }
  }
}
