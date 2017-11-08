/**
 * This file contains the LogicalID from every Resource defined in our Stack
 */

module.exports = {
  S3_BUCKET: 's3Bucket',

  FETCH_ARTICLE_FUNCTION: 'FetchArticleFunction',
  PARSE_JSON_FUNCTION: 'ParseJsonFunction',
  NEW_FEED_ITEM_FUNCTION: 'NewFeedItemFunction',

  GRAPHQL_FUNCTION: 'GraphQlFunction',
  GRAPHQL_API_GATEWAY: 'GraphQLApiGateway',
  GRAPHQL_PERMISSIONS: 'GraphQLPermissions',

  DYN_DB_FLOWS: 'DynamoDBFlows',
  DYN_DB_FLOW_RUNS: 'DynamoDBFlowRuns',
  DYN_DB_PROVIDERS: 'DynamoDBProviders',
  DYN_DB_SERVICES: 'DynamoDBServices',
  DYN_DB_TASKS: 'DynamoDBTasks',
  DYN_DB_STEPS: 'DynamoDBSteps',
  DYN_DB_SERVICE_FEEDS: 'DynamoDBServiceFeeds',

  STATE_MACHINE_TRIGGER_FUNCTION: 'StateMachineTriggerFunction',
  STATE_MACHINE_OUTPUT_FUNCTION: 'StateMachineOutputFunction',

  TASK_INITIALIZER_FUNCTION: 'TaskInitializerFunction',
  TASK_OUTPUT_HANDLER_FUNCTION: 'TaskOutputHandlerFunction',

  CAPITALIZE_SERVICE_FUNCTION: 'CapitalizeServiceFunction',

  APPROVE_TASK_FUNCTION: 'ApproveTaskFunction',
  REVIEW_TASK_FUNCTION: 'ReviewTaskFunction',
  CORRECT_TASK_FUNCTION: 'CorrectTaskFunction',

  URL_CONFIG_TRIGGER_SERVICE_FUNCTION: 'UrlConfigTriggerServiceFunction',

  NLP_REQUEST_FUNCTION: 'NLPRequestFunction',

  FLOW_TRIGGER_API_FUNCTION: 'FlowTriggerApiFunction',
  FLOW_TRIGGER_API_GATEWAY: 'FlowTriggerApiGateway',
  FLOW_TRIGGER_API_PERMISSIONS: 'FlowTriggerApiPermission',

  // ** legacy **
  EXTRACT_ARTICLE_DATE_FUNCTION: 'ExtractArticleDateFunction',
  EXTRACT_ARTICLE_READABILITY_FUNCTION: 'ExtractArticleReadabilityFunction',
  EXTRACT_ARTICLE_TEXT_FUNCTION: 'ExtractArticleTextFunction',
  EXTRACT_ARTICLE_TITLE_FUNCTION: 'ExtractArticleTitleFunction',

  FLOW_RUNNER_FUNCTION: 'FlowRunnerFunction',

  MERGE_JSONS_FUNCTION: 'MergeJSONsFunction'
}
