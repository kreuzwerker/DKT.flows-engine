import { graphql } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import Schema from './schema'

const corsHeader = {
  'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Origin': '*'
}

/*
 * graphql service
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const body = _isString(event.body) ? JSON.parse(event.body) : event.body
    const userId = event.requestContext.authorizer.claims.sub
    logger.log('Query:', body.query)
    logger.log('userId:', userId)

    const { query, operationName, variables } = body

    const response = await graphql(Schema, query, null, { userId }, variables, operationName)
    logger.log('Result:', JSON.stringify(response, null, 2))

    if (response.errors) {
      callback(null, {
        // Workaround for https://github.com/graphql/graphql-js/issues/912
        statusCode: getStatusCode(response.errors[0]),
        headers: corsHeader,
        body: JSON.stringify(response)
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: corsHeader,
        body: JSON.stringify(response)
      })
    }
  } catch (err) {
    logger.log('Error:', err)
    callback({
      statusCode: 500,
      headers: corsHeader,
      body: JSON.stringify({ errors: err })
    })
  }
}

/*
 * Helper method to excerpt the error status code from the error message
 */
function getStatusCode(error) {
  const code = error.message.slice(0, 4)
  if (/^E\d{3}/.test(code)) {
    // User error e.g. E401, E404 etc.
    return 200;
  } else {
    // Internal error
    return 500;
  }
}
