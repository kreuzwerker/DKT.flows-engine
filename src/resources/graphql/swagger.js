const settings = require('../../../settings')


module.exports = () => ({
  'swagger': '2.0',
  'basePath': '/',
  'info': {
    'version': '2016-02-23T05:35:54Z',
    'title': 'GraphQL'
  },
  'schemes': [
    'https'
  ],
  'paths': {
    '/graphql': {
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
              'statusCode': 200
            }
          },
          'uri': `arn:aws:lambda:${settings.aws.lambda.region}:${settings.aws.account}:function:DKT-flow-engine-GraphQL-112KCJWK51TZ3/invocations`,
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
              'statusCode': 200,
              'responseParameters': {
                'method.response.header.Access-Control-Allow-Methods': "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              }
            }
          },
          'passthroughBehavior': 'when_no_match',
          'requestTemplates': {
            'application/json': '{\'statusCode\': 200}'
          },
          'type': 'mock'
        }
      }
    },
    '/graphql/{proxy+}': {
      'x-amazon-apigateway-any-method': {
        'x-amazon-apigateway-auth': {
          'type': 'aws_iam'
        },
        'produces': [
          'application/json'
        ],
        'parameters': [
          {
            'name': 'proxy',
            'in': 'path',
            'required': true,
            'type': 'string'
          }
        ],
        'responses': {},
        'x-amazon-apigateway-integration': {
          'uri': `arn:aws:lambda:${settings.aws.lambda.region}:${settings.aws.account}:function:DKT-flow-engine-GraphQL-112KCJWK51TZ3/invocations`,
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
              'statusCode': 200,
              'responseParameters': {
                'method.response.header.Access-Control-Allow-Methods': "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              }
            }
          },
          'passthroughBehavior': 'when_no_match',
          'requestTemplates': {
            'application/json': '{\'statusCode\': 200}'
          },
          'type': 'mock'
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
