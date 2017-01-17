import Lambda from '../../../utils/lambda'
import settings from '../../../../settings'
import S3 from '../../../utils/s3'


/*
 * Root resolvers
 */
export const Query = {
  services: async () => {
    const result = await Lambda.listFunctions()
    return result.Functions || []
  },

  service: async (_, { FunctionName }) => {
    const result = await Lambda.getFunction({ FunctionName })
    return result.Configuration || {}
  }
}


/*
 * Field resolvers
 */
export const s3 = {
  info: ({ FunctionName }) => ({
    Bucket: settings.aws.s3.bucket,
    Prefix: `${FunctionName}/out/`
  }),

  content: async ({ Bucket, Prefix }) => {
    const result = await S3.listObjects({ Bucket, Prefix })
    return result.Contents
  }
}
