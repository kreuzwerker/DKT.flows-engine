/**
 * This file contains the LogicalID from every Resource defined in our Stack
 */

module.exports = {
  S3_BUCKET: 's3Bucket',

  FETCH_ARTICLE_FUNCTION: 'FetchArticleFunction',

  GRAPHQL_FUNCTION: 'GraphQlFunction',
  GRAPHQL_API_GATEWAY: 'GraphQLApiGateway',
  GRAPHQL_PERMISSIONS: 'GraphQLPermissions',

  DYN_DB_FLOWS: 'DynamoDBFlows',
  DYN_DB_FLOW_RUNS: 'DynamoDBFlowRuns',
  DYN_DB_PROVIDERS: 'DynamoDBProviders',
  DYN_DB_SERVICES: 'DynamoDBServices',
  DYN_DB_STEPS: 'DynamoDBSteps',

  STATE_MACHINE_TRIGGER_FUNCTION: 'StateMachineTriggerFunction',
  STATE_MACHINE_OUTPUT_FUNCTION: 'StateMachineOutputFunction',

  CAPITALIZE_SERVICE_FUNCTION: 'CapitalizeServiceFunction',

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
