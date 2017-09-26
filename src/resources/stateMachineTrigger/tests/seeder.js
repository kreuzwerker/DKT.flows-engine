import uuid from 'uuid'
import AWS from '../../../../lib/aws/aws'
import settings from '../../../../settings'
import testData from './testData.json'

export default function testdata() {
  AWS.config.apiVersions = { stepfunctions: settings.aws.stepFunctions.apiVersion }
  const { arn } = settings.aws.stepFunctions
  const stepFunctions = new AWS.StepFunctions(settings.aws.stepFunctions)

  return {
    seed: () =>
      stepFunctions
        .createStateMachine({
          definition: JSON.stringify(testData),
          name: `dontDeleteMe-${uuid.v1()}`,
          roleArn: arn
        })
        .promise(),

    delete: stateMachineArn => stepFunctions.deleteStateMachine({ stateMachineArn }).promise()
  }
}
