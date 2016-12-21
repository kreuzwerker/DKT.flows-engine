import Logger from './logger'


describe('Logger', function () {
  it('has a log function', function () {
    expect(Logger()).to.have.ownProperty('log')
  })

  describe('.log', function () {
    it('returns null per default', function () {
      const logger = Logger()
      expect(logger.log('some log message')).to.be.null
    })


    it('logs when with true verbose parameter', function () {
      const logger = Logger(true)
      expect(logger.log('')).not.to.be.null
    })


    it('can receive multiple parameters', function () {
      const logger = Logger(true)
      expect(logger.log('', '', '', '')).to.not.throw
    })
  })
})
