/*
 * Custom Logger - console.log when deployed or verbose is set to true
 */
function Logger(verbose = false) {
  const { NODE_ENV } = process.env

  return {
    log: (...messages) => {
      if (NODE_ENV !== 'development' || verbose) {
        return console.log(...messages)
      }
      return null
    }
  }
}


module.exports = Logger
