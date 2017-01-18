import { graphql } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import Schema from './schema'

/*
 * graphql service
 */
export async function handler(event, context) {
  try {
    const logger = Logger(event.verbose)
    const { query } = _isString(event) ? JSON.parse(event) : event
    logger.log('Query:', query)
    const response = await graphql(Schema, query)
    context.succeed(JSON.stringify(response))
  } catch (err) {
    context.fail(err)
  }
}
