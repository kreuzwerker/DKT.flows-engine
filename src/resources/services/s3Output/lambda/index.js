import service from '../../../../utils/service'
import { S3 } from '../../../../utils/aws'

function s3Output(inputData, { configParams }, logger) {
  const bucket = configParams.get('bucket')
  const path = configParams.get('path')
  const filename = configParams.get('filename')
  const s3 = S3(bucket)

  return s3
    .putObject({
      Key: `${filename}.json`,
      Body: JSON.stringify({ data: inputData }, null, 2)
    })
    .then((res) => {
      logger.log(JSON.stringify(
        {
          bucket,
          path,
          filename,
          resuls: res
        },
        null,
        2
      ))
      return JSON.stringify(inputData, null, 2)
    })
}

export const handler = service(s3Output)
