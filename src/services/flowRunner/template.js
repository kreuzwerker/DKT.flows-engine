const settings = require('../../../settings')

/**
 * AWS Service Application Model Template
 * @param  {object} args   - service specific arguments
 * @return {Object}        - AWS SAM Template
 */
module.exports = ({ key }) => ({
  FlowRunner: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Environment: {
        Variables: {
          S3_BUCKET: 'dkt.flow-engine.test'
        }
      },
      Events: {
        ApiResource: {
          Type: 'Api',
          Properties: {
            Path: '/run',
            Method: 'put'
          }
        }
      }
    }
  }
})
