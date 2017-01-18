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


  putLambdaBundlesToS3: (bundles) => {
    return Promise.all(bundles.map(({ fnName, bundlePath }) => {
      const lambdaName = `${fnName}-${uuidV1()}`
      const s3Key = `resources/${fnName}/${lambdaName}.zip`

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


  createCloudFormationTmpl: (deployedBundles) => {
    logger.log('Create CloudFormation definition dkt-flow-engine-template.json')
    const resourceTmplPath = path.join(settings.fs.dist.base, 'dkt-flow-engine-template.json')
    const baseTmpl = require('../src/stackBaseTemplate.json') // eslint-disable-line
    let cloudFormationTmpl = Object.assign({}, baseTmpl, { Resources: {} })

    deployedBundles.forEach(({ resource, key }) => {
      const resourceTmpl = require(fsUtil.getResourceTemplatePath(resource)) // eslint-disable-line
      const updatedResource = Object.assign({}, cloudFormationTmpl.Resources, resourceTmpl({ key }))
      cloudFormationTmpl = Object.assign({}, cloudFormationTmpl, {
        Resources: updatedResource
      })
    })

    fs.writeFileSync(resourceTmplPath, JSON.stringify(cloudFormationTmpl, null, 2))
    return Promise.resolve(resourceTmplPath)
  },


  deployCloudFormationTmpl: (tmplPath) => {
    logger.log('Deploy dkt-flow-engine-template.json')
    return CloudFormation.deploy(tmplPath)
  }
})
