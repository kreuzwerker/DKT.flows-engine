import Lambda from '../../utils/lambda'
import settings from '../../../settings'
import S3 from '../../utils/s3'


/*
 * Query resolvers
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
 * field resolvers
 */
export function s3({ FunctionName }) {
  return ({
    Bucket: settings.aws.s3.bucket,
    Prefix: `${FunctionName}/out/`
  })
}


export async function s3Content({ Bucket, Prefix }) {
  const result = await S3.listObjects({ Bucket, Prefix })
  return result.Contents
}
