const exec = require('child_process').exec
const AWS = require('./aws')
const settings = require('../../settings')


/**
 * AWS SDK Cloudformation Factory to simplify the CloudFormation deployment
 */
function CloudFormation() {
  const { stackName, capabilities, region } = settings.aws.cloudFormation


  function execPromise(command) {
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err) return reject(err)
        if (stderr) return reject(stderr)
        return resolve(stdout)
      })
    })
  }


  return {
    deploy: (tmplFile) => {
      return execPromise(`aws cloudformation deploy --template-file ${tmplFile} --stack-name ${stackName} --capabilities ${capabilities} --region ${region}`)
    }
  }
}


module.exports = CloudFormation()
