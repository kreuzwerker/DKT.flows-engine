const colors = require('colors')


function Logger(name, verbose = false) {
  let _verbose = verbose

  return {
    setVerbose: v => (_verbose = v),

    log: (...args) => {
      if (_verbose) {
        console.log(`[${name}]`, ...args)
      }
    },

    success: (...args) => {
      if (_verbose) {
        console.log(`[${name}]`, 'SUCCESS'.green, ...args)
      }
    },

    error: (...args) => {
      console.error(`[${name}]`, 'ERROR'.red, ...args)
    }
  }
}


module.exports = Logger
