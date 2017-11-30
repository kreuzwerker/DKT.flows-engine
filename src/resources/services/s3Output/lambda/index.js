import AWS from 'aws-sdk'
import service from '../../../../utils/service'
import { S3, SSM } from '../../../../utils/aws'

function getParameter(name) {
  return SSM.getParameter({ Name: name }, true).then(res => res.Parameter.Value)
}

async function s3Output(inputData, { configParams, currentStep }, logger) {
  const bucket = configParams.get('bucket')
  const path = configParams.get('path')
  const filename = configParams.get('filename')

  // TODO aws credentials
  // const accessKey = configParams.get('accessKey')
  // const secretParamName = SSM.createParameterName(currentStep.id, 'accessSecretKey')
  //
  // const accessSecretKey = await getParameter(secretParamName)
  // const credentials = {
  //   accessKeyId: accessKey,
  //   secretAccessKey: accessSecretKey
  // }

  console.log(JSON.stringify(currentStep, null, 2))

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
