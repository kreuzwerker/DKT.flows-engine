/*
 * CloudWatchEvents Utitlity
 */
import AWS from 'aws-sdk'
import settings from '../../../settings'

function CloudWatchEvents() {
  const cloudWatchEvents = new AWS.CloudWatchEvents(settings.aws.cloudWatchEvents)

  return {
    putRule: params => cloudWatchEvents.putRule(params).promise(),
    disableRule: params => cloudWatchEvents.disableRule(params).promise(),
    enableRule: params => cloudWatchEvents.enableRule(params).promise(),
    deleteRule: params => cloudWatchEvents.deleteRule(params).promise(),
    putTargets: params => cloudWatchEvents.putTargets(params).promise(),
    removeTargets: params => cloudWatchEvents.removeTargets(params).promise()
  }
}

export default CloudWatchEvents()
