import { CloudWatchEvents, Lambda } from './aws'

export function createScheduledEvent(ruleName, { interval }, service, payload) {
  return CloudWatchEvents.putRule({
    Name: ruleName,
    ScheduleExpression: `rate(${interval} minutes)`
  }).then(({ RuleArn }) =>
    Promise.all([
      Lambda.addPermission({
        StatementId: ruleName,
        Action: 'lambda:InvokeFunction',
        FunctionName: service.arn,
        Principal: 'events.amazonaws.com',
        SourceArn: RuleArn
      }),
      CloudWatchEvents.putTargets({
        Rule: ruleName,
        Targets: [
          {
            Arn: service.arn,
            Id: service.id,
            Input: JSON.stringify(payload, null, 2)
          }
        ]
      })
    ]).then(() => RuleArn))
}

export function enableScheduledEvent(ruleName) {
  return CloudWatchEvents.enableRule({
    Name: ruleName
  })
}

export function disableScheduledEvent(ruleName) {
  return CloudWatchEvents.disableRule({
    Name: ruleName
  })
}

export function removeScheduledEvent(scheduledTriggerName, service) {
  return CloudWatchEvents.removeTargets({
    Ids: [service.id],
    Rule: scheduledTriggerName
  }).then(() =>
    Promise.all([
      CloudWatchEvents.deleteRule({
        Name: scheduledTriggerName
      }),
      Lambda.removePermission({
        FunctionName: service.arn,
        StatementId: scheduledTriggerName
      })
    ]))
}
