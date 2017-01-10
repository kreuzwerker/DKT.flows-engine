import { graphql, buildSchema } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../utils/logger'
import * as Data from './data'

const schema = buildSchema(`
  type Query {
    services: String
  }
`)


/*
 * get available services (lambdas) using graphql
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const { query } = _isString(event) ? JSON.parse(event) : event

    logger.log('Query:', query)
    const response = await graphql(schema, query, Data)

    logger.log('Response:', response)
    callback(null, JSON.stringify(response))
  } catch (err) {
    callback(err)
  }
}
