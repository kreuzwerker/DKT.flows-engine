/*
 * Utitlity Module to promisify async functions without the signature (input, callback)
 */


/*
 * Wrap AWS Lambda functions into a promise
 * @param  {function} lambda - lambda handler function
 * @return {Promise<Object>} - Promise with lambda handler result
 */
export function promisifyLambda(lambda) {
  return (event, context) => new Promise((resolve, reject) => {
    lambda(event, context, (err, res) => {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}
