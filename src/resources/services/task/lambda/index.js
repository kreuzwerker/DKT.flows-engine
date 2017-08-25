// THIS IS A TAKS WORKER. NOT A REGULAR SERVICE LAMBDA.
// A TAKS WORKER CANNOT BE PART OF A STATEMACHINE
export function handler(inputData, logger) {
  logger.log(inputData)
  return 'foobar'
}
