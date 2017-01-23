const settings = require('../../../settings.js')


module.exports = () => ({
  'swagger': '2.0',
  'info': {
    'version': '2017-01-23T12:50:55Z',
    'title': 'dev-graphql'
  },
  'host': 'c4s4adns5e.execute-api.eu-west-1.amazonaws.com',
  'basePath': '/dev',
  'schemes': [
    'https'
  ],
  'paths': {
    '/graphql': {
      'post': {
        'responses': {},
        'x-amazon-apigateway-integration': {
          'uri': 'arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:' + settings.aws.lambda.region + ':' + settings.aws.account + ':function:DKT-flow-engine-GraphQL-1I5YJ6ODL6UE9/invocations', // eslint-disable-line
          'passthroughBehavior': 'when_no_match',
          'httpMethod': 'POST',
          'type': 'aws_proxy'
        }
      },
      'options': {
        'consumes': [
          'application/json'
        ],
        'produces': [
          'application/json'
        ],
        'responses': {
          '200': {
            'description': '200 response',
            'headers': {
              'Access-Control-Allow-Origin': {
                'type': 'string'
              },
              'Access-Control-Allow-Methods': {
                'type': 'string'
              },
              'Access-Control-Allow-Headers': {
                'type': 'string'
              }
            }
          }
        },
        'x-amazon-apigateway-integration': {
          'responses': {
            'default': {
              'statusCode': '200',
              'responseParameters': {
                'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST'",
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              }
            }
          },
          'requestTemplates': {
            'application/json': '{statusCode:200}'
          },
          'passthroughBehavior': 'when_no_match',
          'type': 'mock'
        }
      }
    }
  }
})
