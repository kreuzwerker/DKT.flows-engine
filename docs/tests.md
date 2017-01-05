# DKT.flows-engine Testing

We're using [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) for testing.  
**Each Lambda function and each Workflow has to be tested.**

Run all tests with

``` shell
Usage: cli/dkt test all [options]

Test everything

Options:

  -h, --help  output usage information
```

#### Lambdas

Each lambda should have a `test.js` file within its directory (`src/lambdas/<functionName>/test.js`).
Run the tests for a single lambda function with

```shell
Usage: cli/dkt test lambdas [options]

Test Lambdas

Options:

  -h, --help             output usage information
  -f, --function <name>  only one function
```

e.g. `cli/dkt test lambdas -f fetchArticle`


#### StepFunctions

StepFunctions tests are defined within the workflows `test.js` file (`src/workflows/tests.js`). *We will change this in the future.*  
Run the workflows tests with

```shell
Usage: cli/dkt test workflows [options]

Test Workflows

Options:

  -h, --help  output usage information
```
