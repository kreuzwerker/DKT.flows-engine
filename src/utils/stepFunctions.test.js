import StepFunctions from './stepFunctions'


describe('StepFunctions Util', function () {
  it('has a startExecution function', function () {
    expect(StepFunctions).to.have.ownProperty('startExecution')
  })
})
