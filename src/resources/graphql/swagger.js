const settings = require('../../../settings.js')


module.exports = () => ({
  'swagger': '2.0',
  'info': {
    'version': '2017-01-19T15:32:07Z',
    'title': 'GraphQLApiGateway'
  },
  'basePath': '/',
  'schemes': [
    'https'
  ],
  'paths': {
    '/graphql': {
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
            'schema': {
              '$ref': '#/definitions/Empty'
            },
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
                'method.response.header.Access-Control-Allow-Methods': "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              }
            }
          },
          'requestTemplates': {
            'application/json': '{\'statusCode\': 200}'
          },
          'passthroughBehavior': 'when_no_match',
          'type': 'mock'
        }
      },
      'x-amazon-apigateway-any-method': {
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
          'uri': 'arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:' + settings.aws.lambda.region + ':' + settings.aws.account + ':function:DKT-flow-engine-GraphQL-1I5YJ6ODL6UE9/invocations', // eslint-disable-line
          'passthroughBehavior': 'when_no_match',
          'httpMethod': 'POST',
          'contentHandling': 'CONVERT_TO_TEXT',
          'type': 'aws_proxy'
        }
      }
    }
  },
  'definitions': {
    'Empty': {
      'type': 'object',
      'title': 'Empty Schema'
    }
  }
})
