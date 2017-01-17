const settings = require('../../../settings')


module.exports = ({ key }) => ({
  ExtractArticleReadability: {
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
      }
    }
  }
})
