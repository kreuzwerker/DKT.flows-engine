# DKT.flows-engine

## Requirements

#### [Node](https://nodejs.org/en/)

All the tools and Scripts are written in JavaScript (>ES6). This means you have to install Node. We Support every **Node Version >= 6.9.2.** (since this is the latest [Long-term Support Version](https://github.com/nodejs/LTS)).  
You can install node via [NVM](https://github.com/creationix/nvm), [Homebrew](http://brew.sh/) (on macOS) or you download a installer from [nodejs.org/](https://nodejs.org/).

- NVM: `nvm install 6.9.2` *(recommended)*
- brew: `brew install node`

When you have to change the node version from time to time (e.g. for different projects) then you can run `$ nvm use` when entering the project directory. This will select the node version defined within the `.nvmrc` file. Or you add [this code snipped (link)](https://github.com/creationix/nvm#zsh) to your `.zshrc`.

#### [AWS](https://aws.amazon.com/documentation/)

If you want to interact with AWS (deploying, ... etc.) then you have to define a [named Profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-multiple-profiles) `[DKT]` within your `~/.aws/credentials` file.

```
[DKT]
aws_access_key_id = <yourAccessKey>
aws_secret_access_key = <yourSecretAccessKey>
```

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

```shell
$ gulp lambda:build  # builds all lambda functions
$ gulp lambda:build --function <functionName>  # builds one function
```

#### Bundle

```shell
$ gulp lambda:bundle  # build and bundle all lambda functions
$ gulp lambda:bundle --function <functionName>  # build and bundle one function
```

### StepFunctions

Check the [Getting Started Guide](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html) first!
Stepfunctions flows are defined within `src/workflows`.

## Testing

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

## Deployment

#### Lambdas

```shell
$ gulp lambda:deploy  # build, bundle and deploy all lambda functions
$ gulp lambda:deploy --function <functionName>  # build, bundle and deploy the one lambda function
```

#### StepFunctions

```shell
$ gulp steps:deploy --workflow <workflowNameWithoutPrefix>
```
