const settings = require('../../../../settings')
const { NLP_REQUEST_FUNCTION, S3_BUCKET } = require('../../locicalResourceIds')


/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key }) => ({
  [NLP_REQUEST_FUNCTION]: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      Runtime: 'nodejs4.3',
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: 20,
      Environment: {
        Variables: {
          S3_BUCKET: S3_BUCKET,
          NLP_URL: 'http://kreuzwerker-dkt-nlp-loadbalancer-1465345853.eu-west-1.elb.amazonaws.com/e-nlp/namedEntityRecognition'
        }
      }
    }
  }
})
