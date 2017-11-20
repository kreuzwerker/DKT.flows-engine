import _isString from 'lodash/isString'

export async function handler(event, context, callback) {
  const input = _isString(event) ? JSON.parse(event) : event
  callback(null, input[1])
}
