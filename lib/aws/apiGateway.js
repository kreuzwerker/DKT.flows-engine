const Fs = require('fs')
const Path = require('path')
const AWS = require('./aws')
const settings = require('../../settings')


/**
 * AWS SDK ApiGateway Factory to simplify the ApiGateway deployment
 */
function ApiGateway() {
  const { apiVersion, restApiId } = settings.aws.apiGateway
  const apiGateway = new AWS.APIGateway({ apiVersion })
  const api = stage => ({
    'swagger': '2.0',
    'info': {
      'version': '2017-01-06T15:41:03Z',
      'title': settings.aws.apiGateway.title
    },
    'host': settings.aws.apiGateway.host,
    'basePath': `/${stage}`,
    'schemes': [
      'https'
    ],
    'definitions': {
      'Empty': {
        'type': 'object',
        'title': 'Empty Schema'
      }
    }
  })


  function requirePathDefinitions() {
    const { base } = settings.fs.api
    return Fs.readdirSync(base)
             .filter(file => file.indexOf('.test') === -1)
             .map(file => require(Path.join(base, file))) // eslint-disable-line
  }


  function createStageIfNotExist(stageName) {
    return apiGateway.getStages({ restApiId }).promise()
      .then(stages => stages.item.filter(s => s.stageName === stageName).length > 0)
      .then((stageExists) => {
        if (stageExists) return Promise.resolve()
        return apiGateway.createDeployment({ restApiId }).promise()
          .then(data => apiGateway.createStage({ restApiId, stageName,
            deploymentId: data.id
          }).promise())
      })
  }


  return {
    deploy: (stage) => {
      const paths = requirePathDefinitions()
      const apiDefinition = api(stage)

      apiDefinition.paths = paths.reduce((a, b) => Object.assign({}, a, b), {})

      const params = { restApiId,
        mode: settings.aws.apiGateway.mode,
        body: JSON.stringify(apiDefinition)
      }

      return createStageIfNotExist(stage).then(() => apiGateway.putRestApi(params).promise())
    }
  }
}


module.exports = ApiGateway()
