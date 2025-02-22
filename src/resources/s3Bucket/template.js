const { S3_BUCKET } = require('../logicalResourceIds')

module.exports = ({ stage }) => ({
  [S3_BUCKET]: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: `dkt.flow-engine.${stage.toLowerCase()}`
    }
  }
})
