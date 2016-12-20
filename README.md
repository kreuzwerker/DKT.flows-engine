# DKT.flows-engine

## Development

Lambdas can be written in ES6 including async functions. We Transform and bundle the Lambda Function with [webpack](https://webpack.github.io/) and [babel](https://babeljs.io/) using the [latest preset](https://babeljs.io/docs/plugins/preset-latest/).  
Tools and Scripts written to handle the lambda functions (such as the deployment scripts etc.) should be written for Node v7.


#### Styleguide

I **strongly recommend** to install a realtime linter extension to your Editor. Otherwise you have to run `npm run lint` all the time.
We're using [ESLint](http://eslint.org/) with a slightly modified version of the [Airbnb styleguide](https://github.com/airbnb/javascript). Check the `.eslintrc` file for details.


### Lambda

Check the [Getting Started Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) first!
You'll find all Lambda functions within `src/functons`.

#### Build

    $ gulp lambda:build  # builds all lambda functions
    $ gulp lambda:build --function <functionName>  # builds one function


#### Bundle

    $ gulp lambda:bundle  # build and bundle all lambda functions
    $ gulp lambda:bundle --function <functionName>  # build and bundle one function


### StepFunctions

Check the [Getting Started Guide](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html) first!
Stepfunctions flows are defined within `src/workflows`.

## Testing

We're using [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) for testing.  
**Each Lambda function and each Workflow has to be tested.**

Run all tests with

    $ gulp test


#### Lambdas

Each lambda should have a `test.js` file within its directory (`src/functions/<functionName>/test.js`).
Run the tests for a single lambda function with

    $ gulp test --function <functionName>

To Run all Lambda functions tests you can use

    $ gulp test --functions


#### StepFunctions

StepFunctions tests are defined within the workflows `test.js` file (`src/workflows/tests.js`). *We will change this in the future.*  
Run the workflows tests with

    $ gulp test --workflows


## Deployment

#### Lambdas

    $ gulp lambda:deploy  # build, bundle and deploy all lambda functions
    $ gulp lambda:deploy --function <functionName>  # build, bundle and deploy the one lambda function


#### StepFunctions

    $ gulp steps:deploy --workflow <workflowNameWithoutPrefix>
