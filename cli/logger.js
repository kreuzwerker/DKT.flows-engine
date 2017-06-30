const colors = require('colors')

function Logger(name, verbose = false) {
  let _verbose = verbose

  return {
    setVerbose: v => (_verbose = v),

    log: (...args) => {
      if (_verbose) {
        console.log(`[${name}]`.blue, ...args)
      }
    },

    success: (...args) => {
      if (_verbose) {
        console.log(`[${name}]`.green, 'SUCCESS'.green, ...args)
      }
    },

    error: (...args) => {
      console.error(`[${name}]`.red, 'ERROR'.red, ...args)
    }
  }
}

module.exports = Logger
