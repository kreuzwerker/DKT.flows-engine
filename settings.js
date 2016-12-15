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
      timeout: 5
    },
    s3: {
      apiVersion: '2006-03-01',
      bucket: 'dkt-stepfunctions-test'
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
    functions: {
      base: Path.resolve(__dirname, 'src', 'functions'),
      handler: 'index.js'
    },
    workflows: {
      base: Path.resolve(__dirname, 'src', 'workflows')
    },
    dist: {
      base: Path.resolve(__dirname, 'dist')
    }
  }
}
