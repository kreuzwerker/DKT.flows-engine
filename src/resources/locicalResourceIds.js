/**
 * This file contains the LogicalID from every Resource defined in our Stack
 */

module.exports = {
  S3_BUCKET: 's3Bucket',

  FETCH_ARTICLE_FUNCTION: 'FetchArticleFunction',

  GRAPHQL_FUNCTION: 'GraphQlFunction',
  GRAPHQL_API_GATEWAY: 'GraphQLApiGateway',
  GRAPHQL_PERMISSIONS: 'GraphQLPermissions',
  GRAPHQL_DB_FLOWS: 'GraphQLDynamoFlows',
  GRAPHQL_DB_FLOW_RUNS: 'GraphQLDynamoFlowRuns',
  GRAPHQL_DB_PROVIDERS: 'GraphQLDynamoProviders',
  GRAPHQL_DB_SERVICES: 'GraphQLDynamoServices',
  GRAPHQL_DB_STEPS: 'GraphQLDynamoSteps',

  STATE_MACHINE_TRIGGER_FUNCTION: 'StateMachineTriggerFunction',
  STATE_MACHINE_OUTPUT_FUNCTION: 'StateMachineOutputFunction',


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
