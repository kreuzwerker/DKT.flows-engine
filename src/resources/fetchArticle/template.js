const settings = require('../../../settings')


/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key }) => ({
  FetchArticle: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: settings.aws.s3.bucket
        }
      }
    }
  }
})
