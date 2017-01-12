const settings = require('../../../settings')

/**
 * AWS Service Application Model Template
 * @param  {object} args   - service specific arguments
 * @return {Object}        - AWS SAM Template
 */
module.exports = ({ lambda }) => ({
  AWSTemplateFormatVersion: '2010-09-09',
  Transform: 'AWS::Serverless-2016-10-31',
  Description: 'Simple graphql service',
  Resources: {
    GraphQLFunction: {
      Type: 'AWS::Serverless::Function',
      Properties: {
        Handler: 'index.handler',
        Runtime: 'nodejs4.3',
        CodeUri: `s3://dkt.flow-engine.test/services/graphql/${lambda}.zip`,
        Policies: settings.aws.lambda.arn,
        Environment: {
          Variables: {
            S3_BUCKET: 'dkt.flow-engine.test'
          }
        },
        Events: {
          ApiResource: {
            Type: 'Api',
            Properties: {
              Path: '/graphql',
              Method: 'post'
            }
          }
        }
      }
    }
  }
})
