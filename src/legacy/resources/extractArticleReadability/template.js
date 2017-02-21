const settings = require('../../../settings')
const { EXTRACT_ARTICLE_READABILITY_FUNCTION, S3_BUCKET } = require('../locicalResourceIds')


/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key }) => ({
  [EXTRACT_ARTICLE_READABILITY_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: S3_BUCKET
        }
      }
    }
  }
})
