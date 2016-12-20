# DKT.flows-engine Testing

We're using [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) for testing.  
**Each Lambda function and each Workflow has to be tested.**

Run all tests with

``` shell
$ gulp test
```

#### Lambdas

Each lambda should have a `test.js` file within its directory (`src/functions/<functionName>/test.js`).
Run the tests for a single lambda function with

```shell
$ gulp test --function <functionName>
```

To Run all Lambda functions tests you can use

```shell
$ gulp test --functions
```

#### StepFunctions

StepFunctions tests are defined within the workflows `test.js` file (`src/workflows/tests.js`). *We will change this in the future.*  
Run the workflows tests with

```shell
$ gulp test --workflows
```
