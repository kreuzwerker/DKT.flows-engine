# DKT.flows-engine Development

Lambdas can be written in ES6 including async functions. We Transform and bundle the Lambda Function with [webpack](https://webpack.github.io/) and [babel](https://babeljs.io/) using the [latest preset](https://babeljs.io/docs/plugins/preset-latest/). See the `.babelrc` file for details.  
Tools and Scripts written to handle the lambda functions (such as the deployment scripts etc.) should be written for Node 6.9.2.  
Check the [compat-table](https://kangax.github.io/compat-table/es6/) for more details about which ES6/ES7 features are supported or not.

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
