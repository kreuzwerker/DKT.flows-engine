const exec = require('child_process').exec
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
    deploy: (tmplFile, stage) => {
      const deployCommand = `aws cloudformation deploy --template-file ${tmplFile} --stack-name ${stackName}-${stage} --capabilities ${capabilities} --region ${region}`
      console.log('Deploy with aws cli')
      console.log('ecex:', deployCommand)
      return execPromise(deployCommand)
    }
  }
}


module.exports = CloudFormation()
