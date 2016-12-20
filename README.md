# DKT.flows-engine

## Development

Lambdas can be written in ES6 including async functions. We Transform and bundle the Lambda Function with [webpack](https://webpack.github.io/) and [babel](https://babeljs.io/) using the [latest preset](https://babeljs.io/docs/plugins/preset-latest/).  
Tools and Scripts written to handle the lambda functions (such as the deployment scripts etc.) should be written for Node v7.


#### Styleguide

I **strongly recommend** to install a realtime linter extension to your Editor. Otherwise you have to run `npm run lint` all the time.
We're using [ESLint](http://eslint.org/) with a slightly modified version of the [Airbnb styleguide](https://github.com/airbnb/javascript). Check the `.eslintrc` file for details.


### Lambda

#### Build

    $ gulp lambda:build  # builds all lambda functions
    $ gulp lambda:build --function <functionName>  # builds one function


#### Bundle

    $ gulp lambda:bundle  # build and bundle all lambda functions
    $ gulp lambda:bundle --function <functionName>  # build and bundle one function


#### Deployment

    $ gulp lambda:deploy  # build, bundle and deploy all lambda functions
    $ gulp lambda:deploy --function <functionName>  # build, bundle and deploy the one lambda function


#### Tests

Run tests with

    $ gulp test --functions  # test all lambda functions
    $ gulp test --function <functionName>  # test one lambda function


### StepFunctions

#### Deployment

    $ gulp steps:deploy --workflow <workflowNameWithoutPrefix>

#### tests

    $ gulp test --workflows  # test all workflows
