const Path = require('path')


const ACCOUNT = 855433257886


module.exports = {
  aws: {
    account: ACCOUNT,
    credentials: {
      profile: 'DKT'
    },
    cloudFormation: {
      apiVersion: '2010-05-15'
    },
    apiGateway: {
      restApiId: 'mbrnjwzz5a',
      host: 'mbrnjwzz5a.execute-api.eu-west-1.amazonaws.com',
      apiVersion: '2015-07-09',
      title: 'DKT.flow-engine',
      mode: 'overwrite', // overwrite || merge
      region: 'eu-west-1'
    },
    lambda: {
      apiVersion: '2015-03-31',
      arn: `arn:aws:iam::${ACCOUNT}:role/flow-engine-lambda-exec-role`,
      region: 'eu-west-1',
      handler: 'index.handler',
      runtime: 'nodejs4.3',
      timeout: 10
    },
    s3: {
      apiVersion: '2006-03-01',
      bucket: 'dkt.flow-engine.test'
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
    dist: {
      base: Path.resolve(__dirname, 'dist')
    },
    services: {
      base: Path.resolve(__dirname, 'src', 'services')
    }
  },
  tests: {
    timeout: 5000,
    includeStack: true
  }
}
