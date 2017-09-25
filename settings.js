const Path = require('path')

const ACCOUNT = 855433257886

module.exports = {
  timezone: 'Europe/Berlin',
  aws: {
    account: ACCOUNT,
    credentials: {
      profile: 'DKT'
    },
    cloudFormation: {
      apiVersion: '2010-05-15',
      stackName: 'DKT-flow-engine',
      policy: `arn:aws:iam::${ACCOUNT}:policy/flow-engine-lambda-exec-role`,
      capabilities: 'CAPABILITY_IAM',
      region: 'eu-west-1'
    },
    apiGateway: {
      restApiId: 'mbrnjwzz5a',
      host: 'mbrnjwzz5a.execute-api.eu-west-1.amazonaws.com',
      apiVersion: '2015-07-09',
      title: 'DKT-flow-engine',
      mode: 'overwrite', // overwrite || merge
      region: 'eu-west-1'
    },
    dynamoDB: {
      apiVersion: '2012-08-10',
      region: 'eu-west-1'
    },
    lambda: {
      apiVersion: '2015-03-31',
      arn: `arn:aws:iam::${ACCOUNT}:role/lambda_s3_exec_role`,
      region: 'eu-west-1',
      handler: 'index.handler',
      runtime: 'nodejs4.3',
      timeout: 20
    },
    s3: {
      apiVersion: '2006-03-01',
      bucket: 'dkt.flow-engine.resources'
    },
    stepFunctions: {
      apiVersion: '2016-11-23',
      arn: `arn:aws:iam::${ACCOUNT}:role/service-role/StatesExecutionRole-eu-west-1`
    }
  },
  fs: {
    project: {
      base: Path.resolve(__dirname)
    },
    api: {
      base: Path.resolve(__dirname, 'src', 'api')
    },
    lambdas: {
      base: Path.resolve(__dirname, 'src', 'lambdas'),
      handler: 'index.js'
    },
    workflows: {
      base: Path.resolve(__dirname, 'src', 'workflows')
    },
    resources: {
      base: Path.resolve(__dirname, 'src', 'resources'),
      services: {
        base: Path.resolve(__dirname, 'src', 'resources', 'services')
      }
    },
    dist: {
      base: Path.resolve(__dirname, 'dist'),
      resources: Path.resolve(__dirname, 'dist', 'resources')
    }
  },
  tests: {
    timeout: 5000,
    includeStack: true
  }
}
