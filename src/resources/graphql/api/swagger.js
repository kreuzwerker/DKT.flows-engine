const settings = require('../../../../settings.js')

const { apiGateway, lambda, account } = settings.aws


module.exports = ({ stage }) => ({
  'swagger': '2.0',
  'info': {
    'title': `DKT.flow-engine.${stage}.graphql`,
    'version': new Date()
  },
  'basePath': '/prod',
  'schemes': ['https'],
  'paths': {
    '/': {
      'post': {
        'produces': ['application/json'],
        'responses': {
          '200': {
            'description': '200 response',
            'schema': { $ref: '#/definitions/Empty' },
            'headers': {
              'Access-Control-Allow-Origin': { 'type': 'string' }
            }
          }
        },
        'x-amazon-apigateway-integration': {
          'responses': {
            'default': {
              'statusCode': '200',
              'responseParameters': {
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              }
            }
          },
          'uri': [
            `arn:aws:apigateway:${apiGateway.region}:lambda:path/${lambda.apiVersion}/functions/`,
            `arn:aws:lambda:${lambda.region}:${account}:function:`,
            /* eslint-disable */
            '${stageVariables.LambdaFunctionName}/invocations' // TODO quick and dirty hack. we need to run the deployment twice because of this. but at the moment there's no better solution...
            /* eslint-enable */
          ].join(''),
          'passthroughBehavior': 'when_no_match',
          'httpMethod': 'POST',
          'type': 'aws_proxy'
        }
      },
      'options': {
        'consumes': ['application/json'],
        'produces': ['application/json'],
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
            'application/json': "{'statusCode': 200}"
          },
          'passthroughBehavior': 'when_no_match',
          'type': 'mock'
        }
      }
    }
  }
})
