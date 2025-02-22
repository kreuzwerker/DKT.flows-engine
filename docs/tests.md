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

#### resources

Each lambda should have a `test.js` file within its directory (`src/lambdas/<functionName>/test.js`).
Run the tests for a single lambda function with

```shell
Usage: cli/dkt test resources [options]

Test Resources

Options:

  -h, --help             output usage information
  -r, --resource <name>  only one resource
```

e.g. `cli/dkt test resources -r fetchArticle`
