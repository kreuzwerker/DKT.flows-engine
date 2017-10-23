const AWS = require('aws-sdk')
const program = require('commander')
const Logger = require('./logger')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const CloudFormation = require('../lib/aws/cloudFormation')
const settings = require('../settings')
const StackHelpers = require('./stackHelpers')

/*
 * ---- description ------------------------------------------------------------
 */
program._name = 'cli/dkt stack deploy'
program
  .description('Deploy Application Stack')
  .option('-s, --stage <name>', 'stage Dev || Staging || Production - default: Dev')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv)

const logger = Logger(program._name, program.verbose)
const stage = program.stage || 'Dev'

if (stage !== 'Dev' && stage !== 'Test' && stage !== 'Staging' && stage !== 'Production') {
  logger.error(`Invalid stage '${stage}' - Use 'Dev', 'Test', 'Staging' or 'Production'`)
  console.log('                             e.g. cli/dkt stack deploy -s Dev')
  return
}

const {
  bundleLambdas,
  putLambdaBundlesToS3,
  createCloudFormationTmpl,
  deployCloudFormationTmpl,
  getServicesResources
} = StackHelpers(logger)

/*
 * ---- task -------------------------------------------------------------------
 */
logger.log('START', 'Deploy Stack', stage)
logger.log('Build Lambdas')

const lambdaResources = fsUtil.getAllResourcesWithLambda()

function putItem(table, item) {
  const dynamoDB = new AWS.DynamoDB(settings.aws.dynamoDB)
  const documentClient = new AWS.DynamoDB.DocumentClient({ service: dynamoDB })

  const currentDate = new Date().toISOString()
  const newItem = Object.assign({}, item, {
    createdAt: currentDate, // TODO
    updatedAt: currentDate
  })
  const params = {
    Item: newItem,
    ReturnConsumedCapacity: 'TOTAL'
  }

  return documentClient.put(Object.assign({}, params, { TableName: table })).promise()
}

return Promise.all(lambdaResources.map(resourceFn => Lambda.build(resourceFn)))
  .then(lambdas => bundleLambdas(lambdas, settings.fs.dist.resources))
  .then(lambdaBundles => putLambdaBundlesToS3(lambdaBundles, stage))
  .then(deployedBundles => createCloudFormationTmpl(deployedBundles, stage))
  .then(resourceTmplPath => deployCloudFormationTmpl(resourceTmplPath, stage))
  .then(() => CloudFormation.listStackResources(stage))
  .then(stack =>
    getServicesResources(stack.StackResourceSummaries).then(services => [services, stack])
  )
  .then(([services, stack]) => {
    const serviceTableResource = stack.StackResourceSummaries.find(
      resource => resource.LogicalResourceId === 'DynamoDBServices'
    )

    return Promise.all(
      services.map(service => putItem(serviceTableResource.PhysicalResourceId, service))
    )
  })
  .then(res => logger.log('Successfully deployed and updated Services'))
  .catch(err => logger.error(err))
