const colors = require('colors')


function Logger(name, verbose = false) {
  return {
    log: (...args) => {
      if (verbose) {
        console.log(`[${name}]`, ...args)
      }
    },

    success: (...args) => {
      if (verbose) {
        console.log(`[${name}]`, 'SUCCESS'.green, ...args)
      }
    },

    error: (...args) => {
      console.error(`[${name}]`, 'ERROR'.red, ...args)
    }
  }
}


module.exports = Logger
