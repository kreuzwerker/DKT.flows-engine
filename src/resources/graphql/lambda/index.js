import { graphql } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import Schema from './schema'

/*
 * graphql service
 */
export async function handler(event, context, callback) {
  const logger = Logger(true)

  try {
    const body = _isString(event.body) ? JSON.parse(event.body) : event.body
    let response = {}

    if (body.query) {
      logger.log('Query:', body.query)
      response = await graphql(Schema, body.query)
    } else if (body.mutation) {
      logger.log('Mutation:', body.mutation)
      response = await graphql(Schema, body.mutation)
    } else {
      throw new Error("No 'query' or 'mutation' object defined")
    }

    logger.log('Result:', JSON.stringify(response, null, 2))

    callback(null, {
      'statusCode': 200,
      'body': JSON.stringify(response)
    })
  } catch (err) {
    logger.log('Error:', err)
    callback(err)
  }
}
