const settings = require('../../../settings')


/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key }) => ({
  NLPRequest: {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: settings.aws.lambda.handler,
      Runtime: settings.aws.lambda.runtime,
      CodeUri: `s3://${settings.aws.s3.bucket}/${key}`,
      Policies: settings.aws.cloudFormation.policy,
      Timeout: settings.aws.lambda.timeout,
      Environment: {
        Variables: {
          S3_BUCKET: settings.aws.s3.bucket,
          NLP_URL: 'http://kreuzwerker-dkt-nlp-loadbalancer-1465345853.eu-west-1.elb.amazonaws.com/e-nlp/namedEntityRecognition'
        }
      }
    }
  }
})
