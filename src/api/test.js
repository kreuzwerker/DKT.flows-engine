const Fs = require('fs')
const Path = require('path')


describe('Api', function () {
  const paths = Fs.readdirSync(Path.join(__dirname)).filter(file => file.indexOf('test') === -1)

  paths.forEach((defPath) => {
    const name = defPath.split('.')[0]
    const definition  = require(Path.join(__dirname, defPath)) // eslint-disable-line

    it(`${name} definition returns a object`, function () {
      expect(definition).to.be.an('object')
    })

    it(`${name} definition can be stringified`, function () {
      expect(() => JSON.stringify(definition)).to.not.throw(Error)
    })
  })
})
