const path = require('path')
const fs = require('fs')
const uuidV1 = require('uuid/v1')
const fsUtil = require('../lib/fsUtil')
const Lambda = require('../lib/aws/lambda')
const CloudFormation = require('../lib/aws/cloudFormation')
const S3 = require('../lib/aws/s3')
const settings = require('../settings')

/*
 * ---- task helpers -----------------------------------------------------------
 */
module.exports = logger => ({
  bundleLambdas: (resources, targetBase) => {
    return Promise.all(resources.map((resourceFn) => {
      logger.log(`Bundle Lambda ${resourceFn}`)
      return Lambda.bundle(resourceFn, targetBase)
    }))
  },


  putLambdaBundlesToS3: (bundles, stage) => {
    return Promise.all(bundles.map(({ fnName, bundlePath }) => {
      const lambdaName = `${fnName}-${uuidV1()}`
      const s3Key = `${stage}/${fnName}/${lambdaName}.zip`

      logger.log(`Put Lambda ${fnName} as ${lambdaName}.zip to S3`)
      return S3.putObject({
        Key: s3Key,
        Body: fs.createReadStream(bundlePath)
      }).then(() => ({
        resource: fnName,
        key: s3Key
      }))
    }))
  },


  createCloudFormationTmpl: (deployedBundles, stage) => {
    logger.log('Create CloudFormation definition dkt-flow-engine-template.json')
    const resourceTmplPath = path.join(settings.fs.dist.base, 'dkt-flow-engine-template.json')
    const baseTmpl = require('../src/resources/stackBaseTemplate.json') // eslint-disable-line
    const swaggerDefinitionsUploadTasks = []
    let cloudFormationTmpl = Object.assign({}, baseTmpl)

    deployedBundles.forEach(({ resource, key }) => {
      const resourceTmpl = require(fsUtil.getResourceTemplatePath(resource)) // eslint-disable-line
      const swaggerKey = `${stage}/${resource}/swagger-${uuidV1()}.json`
      const swaggerPath = fsUtil.getResourceSwaggerPath(resource)
      const swaggerTmpl = fs.existsSync(`${swaggerPath}.js`) ? require(swaggerPath) : null // eslint-disable-line

      if (swaggerTmpl) {
        swaggerDefinitionsUploadTasks.push(
          S3.putObject({
            Key: swaggerKey,
            Body: JSON.stringify(swaggerTmpl({ stage }))
          })
        )
      }

      const updatedResource = Object.assign({},
        cloudFormationTmpl.Resources,
        resourceTmpl({ stage, resource, key, swaggerKey })
      )

      cloudFormationTmpl = Object.assign({}, cloudFormationTmpl, {
        Resources: updatedResource
      })
    })

    fs.writeFileSync(resourceTmplPath, JSON.stringify(cloudFormationTmpl, null, 2))

    if (swaggerDefinitionsUploadTasks.length >= 1) {
      return Promise.all(swaggerDefinitionsUploadTasks)
        .then(() => Promise.resolve(resourceTmplPath))
    }
    return Promise.resolve(resourceTmplPath)
  },


  deployCloudFormationTmpl: (tmpl, stage) => {
    logger.log('Deploy dkt-flow-engine-template.json')
    return CloudFormation.deploy(tmpl, stage)
  }
})
