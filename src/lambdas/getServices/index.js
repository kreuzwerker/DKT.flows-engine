import { graphql, buildSchema } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../utils/logger'
import * as Data from './data'


/*
 * get available services (lambdas) using graphql
 */
export async function handler(event, context, callback) {
  try {
    const logger = Logger(event.verbose)
    const { query } = _isString(event) ? JSON.parse(event) : event
    // GraphQL Schema
    const schema = buildSchema(`
      type Service {
        FunctionName: String
        FunctionArn: String
        Runtime: String
        Description: String
        LastModified: String
      }

      type Query {
        services: [Service]!
      }
    `)

    logger.log('Query:', query)
    const response = await graphql(schema, query, Data)

    callback(null, JSON.stringify(response))
  } catch (err) {
    callback(err)
  }
}
