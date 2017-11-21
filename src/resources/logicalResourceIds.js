/**
 * This file contains the LogicalID from every Resource defined in our Stack
 */

module.exports = {
  S3_BUCKET: 's3Bucket',

  GRAPHQL_API_GATEWAY: 'GraphQLApiGateway',
  GRAPHQL_FUNCTION: 'GraphQlFunction',
  GRAPHQL_PERMISSIONS: 'GraphQLPermissions',

  DYN_DB_FLOW_RUNS: 'DynamoDBFlowRuns',
  DYN_DB_FLOWS: 'DynamoDBFlows',
  DYN_DB_PROVIDERS: 'DynamoDBProviders',
  DYN_DB_SERVICE_FEEDS: 'DynamoDBServiceFeeds',
  DYN_DB_SERVICES: 'DynamoDBServices',
  DYN_DB_STEPS: 'DynamoDBSteps',
  DYN_DB_TASKS: 'DynamoDBTasks',

  STATE_MACHINE_TRIGGER_FUNCTION: 'StateMachineTriggerFunction',
  STATE_MACHINE_OUTPUT_FUNCTION: 'StateMachineOutputFunction',
  TASK_INITIALIZER_FUNCTION: 'TaskInitializerFunction',
  TASK_OUTPUT_HANDLER_FUNCTION: 'TaskOutputHandlerFunction',

  // ** services **
  // tasks
  APPROVE_TASK_FUNCTION: 'ApproveTaskFunction',
  MODIFY_TASK_FUNCTION: 'ModifyTaskFunction',
  REVIEW_TASK_FUNCTION: 'ReviewTaskFunction',
  // trigger
  FLOW_TRIGGER_API_FUNCTION: 'FlowTriggerApiFunction',
  FLOW_TRIGGER_API_GATEWAY: 'FlowTriggerApiGateway',
  FLOW_TRIGGER_API_PERMISSIONS: 'FlowTriggerApiPermission',
  NEW_FEED_ITEM_FUNCTION: 'NewFeedItemFunction',
  URL_CONFIG_TRIGGER_SERVICE_FUNCTION: 'UrlConfigTriggerServiceFunction',
  // steps
  CAPITALIZE_SERVICE_FUNCTION: 'CapitalizeServiceFunction',
  FETCH_TEXT_FUNCTION: 'FetchTextFunction',
  NLP_REQUEST_FUNCTION: 'NLPRequestFunction',
  MANIPULATE_STRING_FUNCTION: 'ManipulateStringFunction',
  PARSE_CSV_FUNCTION: 'ParseCSVFunction',
  PARSE_JSON_FUNCTION: 'ParseJsonFunction',
  S3_OUTPUT_SERVICE_FUNCTION: 'S3OutputServiceFunction',
  SERIALIZE_CSV_FUNCTION: 'SerializeCSVFunction',

  // ** legacy **
  EXTRACT_ARTICLE_DATE_FUNCTION: 'ExtractArticleDateFunction',
  EXTRACT_ARTICLE_READABILITY_FUNCTION: 'ExtractArticleReadabilityFunction',
  EXTRACT_ARTICLE_TEXT_FUNCTION: 'ExtractArticleTextFunction',
  EXTRACT_ARTICLE_TITLE_FUNCTION: 'ExtractArticleTitleFunction',

  FLOW_RUNNER_FUNCTION: 'FlowRunnerFunction',

  MERGE_JSONS_FUNCTION: 'MergeJSONsFunction',

  SPACY_NER_FUNCTION: 'SpacyNerFunction'
}
