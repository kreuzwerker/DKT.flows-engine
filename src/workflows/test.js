const Fs = require('fs')
const Path = require('path')
const settings = require('../../settings.js')


describe('Workflows', function () {
  const workflows = Fs.readdirSync(Path.join(__dirname)).filter(file => file.indexOf('.json') !== -1)

  workflows.forEach((flow) => {
    const name = flow.split('.')[0]
    let json

    before(function () {
      json = Fs.readFileSync(Path.join(__dirname, flow)).toString()
    })


    it(`'${name}' is a valid JSON`, function () {
      expect(() => JSON.parse(json)).to.not.throw()
    })


    it(`'${name}' has StartAt property`, function () {
      const workflow = JSON.parse(json)
      expect(workflow).to.have.ownProperty('StartAt')
    })


    it(`'${name}' has States property`, function () {
      const workflow = JSON.parse(json)
      expect(workflow).to.have.ownProperty('States')
    })


    it(`'${name}' has Comment property`, function () {
      const workflow = JSON.parse(json)
      expect(workflow).to.have.ownProperty('Comment')
    })
  })
})
