const Fs = require('fs')
const Path = require('path')


describe('Workflows', function () {
  const workflows = Fs.readdirSync(Path.join(__dirname)).filter(file => file.indexOf('.json') !== -1)

  workflows.forEach((flow) => {
    const name = flow.split('.')[0]
    const json = Fs.readFileSync(Path.join(__dirname, flow)).toString()

    it(`'${name}' is a valid JSON`, function () {
      expect(() => JSON.parse(json)).to.not.throw()
    })

    it(`'${name}' has StartAt property`, function () {
      const workflow = JSON.parse(json)
      expect(workflow).to.have.ownProperty('StartAt')
      expect(workflow.StartAt).is.a('string')
    })

    it(`'${name}' has Comment property`, function () {
      const workflow = JSON.parse(json)
      expect(workflow).to.have.ownProperty('Comment')
      expect(workflow.Comment).is.a('string')
    })

    it(`'${name}' has States property`, function () {
      const workflow = JSON.parse(json)
      expect(workflow).to.have.ownProperty('States')
      expect(workflow.States).is.a('object')
    })

    describe(`'${name}' State`, function () {
      const states = JSON.parse(json).States

      Object.keys(states).forEach((key) => {
        it(`'${key}' has 'Type' property`, function () {
          const state = states[key]
          expect(state).to.have.ownProperty('Type')
          expect(state.Type).is.a('string')
        })
      })
    })
  })
})
