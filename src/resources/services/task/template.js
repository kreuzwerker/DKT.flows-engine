const settings = require('../../../../settings')
const { APPROVE_TASK_SERVICE } = require('../../locicalResourceIds')

module.exports = () => ({
  [APPROVE_TASK_SERVICE]: {
    Type: 'AWS::StepFunctions::Activity',
    Properties: {
      Name: 'ManualApproveTask'
    }
  }
})
