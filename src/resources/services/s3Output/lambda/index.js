import service from '../../../../utils/service'
import { S3 } from '../../../../utils/aws'

function getCurrentStep(stepData, input) {
  const int = num => parseInt(num, 10)
  return stepData.flowRun.flow.steps.find(s => int(s.position) === int(input.currentStep))
}

function s3Output(inputData, logger, { input, stepData }) {
  const { configParams } = getCurrentStep(stepData, input)
  const bucket = configParams.find(param => param.fieldId === 'bucket').value
  const path = configParams.find(param => param.fieldId === 'path').value
  const filename = configParams.find(param => param.fieldId === 'filename').value
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
