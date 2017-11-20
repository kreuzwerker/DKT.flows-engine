const settings = require('../../../../settings')
const { SPACY_NER_FUNCTION, S3_BUCKET } = require('../../locicalResourceIds')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key }) => ({
  [SPACY_NER_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs6.10',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: { Ref: S3_BUCKET },
          SPACY_SERVICE_URL: 'http://34.240.40.83:8080/ent'
        }
      }
    },
    DependsOn: [S3_BUCKET]
  }
})
