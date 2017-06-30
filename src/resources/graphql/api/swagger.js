const settings = require('../../../../settings.js')

const { apiGateway, lambda, account } = settings.aws

module.exports = ({ stage }) => ({
  swagger: '2.0',
  info: {
    title: `DKT.flow-engine.${stage}.graphql`,
    version: new Date()
  },
  basePath: '/',
  schemes: ['https'],
  securityDefinitions: {
    UserPool: {
      'type': 'apiKey',
      'name': 'Authorization',
      'in': 'header',
      'x-amazon-apigateway-authtype': 'cognito_user_pools',
      'x-amazon-apigateway-authorizer': {
        type: 'cognito_user_pools',
        providerARNs: ['arn:aws:cognito-idp:eu-west-1:855433257886:userpool/eu-west-1_Csei8EELA']
      }
    }
  },
  paths: {
    '/': {
      post: {
        'produces': ['application/json'],
        'security': [{ UserPool: [] }],
        'responses': {
          '200': {
            description: '200 response',
            schema: { $ref: '#/definitions/Empty' },
            headers: {
              'Access-Control-Allow-Origin': {
                type: 'string'
              },
              'Access-Control-Allow-Methods': {
                type: 'string'
              },
              'Access-Control-Allow-Headers': {
                type: 'string'
              }
            }
          },
          '500': {
            description: '500 response',
            schema: { $ref: '#/definitions/Empty' },
            headers: {
              'Access-Control-Allow-Origin': {
                type: 'string'
              },
              'Access-Control-Allow-Methods': {
                type: 'string'
              },
              'Access-Control-Allow-Headers': {
                type: 'string'
              }
            }
          }
        },
        'x-amazon-apigateway-integration': {
          responses: {
            'default': {
              statusCode: '200'
            },
            '500': {
              statusCode: '200'
            }
          },
          uri: [
            `arn:aws:apigateway:${apiGateway.region}:lambda:path/${lambda.apiVersion}/functions/`,
            `arn:aws:lambda:${lambda.region}:${account}:function:`,
            '${stageVariables.LambdaFunctionName}/invocations' // eslint-disable-line
          ].join(''),
          passthroughBehavior: 'when_no_match',
          httpMethod: 'POST',
          type: 'aws_proxy'
        }
      },
      options: {
        'consumes': ['application/json'],
        'produces': ['application/json'],
        'responses': {
          '200': {
            'description': '200 response',
            'schema': { $ref: '#/definitions/Empty' },
            'headers': {
              'Access-Control-Allow-Origin': {
                type: 'string'
              },
              'Access-Control-Allow-Methods': {
                type: 'string'
              },
              'Access-Control-Allow-Headers': {
                type: 'string'
              }
            },
            '500': {
              description: '500 response',
              schema: { $ref: '#/definitions/Empty' },
              headers: {
                'Access-Control-Allow-Origin': {
                  type: 'string'
                },
                'Access-Control-Allow-Methods': {
                  type: 'string'
                },
                'Access-Control-Allow-Headers': {
                  type: 'string'
                }
              }
            }
          }
        },
        'x-amazon-apigateway-integration': {
          responses: {
            'default': {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Methods':
                  "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
                'method.response.header.Access-Control-Allow-Headers':
                  "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              }
            },
            '500': {
              statusCode: '500'
            }
          },
          passthroughBehavior: 'when_no_match',
          requestTemplates: {
            'application/json': '{"statusCode": 200}' // eslint-disable-line
          },
          type: 'mock'
        }
      }
    }
  },
  definitions: {
    Empty: {
      type: 'object',
      title: 'Empty Schema'
    }
  }
})
