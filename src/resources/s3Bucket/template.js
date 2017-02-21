const settings = require('../../../settings')
const { S3_BUCKET } = require('../locicalResourceIds')

/*
 * AWS SAM Resource Template
 * docs https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
 */
module.exports = ({ key, stage }) => ({
  [S3_BUCKET]: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: `dkt.flow-engine.${stage.toLowerCase()}`
      // CorsConfiguration: {
      //   AllowedOrigins: ['*'],
      //   AllowedMethods: ['GET'],
      //   MaxAge: 3000,
      //   AllowedHeaders: ['Authorization']
      // }
    }
  }
})
