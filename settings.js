const Path = require('path')


module.exports = {
  aws: {
    credentials: {
      profile: 'DKT'
    },
    lambda: {
      apiVersion: '2015-03-31',
      arn: 'arn:aws:iam::855433257886:role/lambda_s3_exec_role',
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
      arn: 'arn:aws:iam::855433257886:role/service-role/StatesExecutionRole-eu-west-1'
    }
  },
  fs: {
    project: {
      base: Path.resolve(__dirname)
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
    }
  },
  tests: {
    timeout: 5000,
    includeStack: true
  }
}
