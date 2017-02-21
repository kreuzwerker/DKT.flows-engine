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
  GRAPHQL_DB_PROVIDERS: 'GraphQLDynamoProviders',
  GRAPHQL_DB_SERVICES: 'GraphQLDynamoServices',
  GRAPHQL_DB_STEPS: 'GraphQLDynamoSteps',

  NLP_REQUEST_FUNCTION: 'NLPRequestFunction',


  // ** legacy **
  EXTRACT_ARTICLE_DATE_FUNCTION: 'ExtractArticleDateFunction',
  EXTRACT_ARTICLE_READABILITY_FUNCTION: 'ExtractArticleReadabilityFunction',
  EXTRACT_ARTICLE_TEXT_FUNCTION: 'ExtractArticleTextFunction',
  EXTRACT_ARTICLE_TITLE_FUNCTION: 'ExtractArticleTitleFunction',

  FLOW_RUNNER_FUNCTION: 'FlowRunnerFunction',

  MERGE_JSONS_FUNCTION: 'MergeJSONsFunction'
}
