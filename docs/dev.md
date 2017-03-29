# DKT.flows-engine Development

### Application Model & Resources

The flow-engine stack is defined with [AWS SAM (Serverless Application Model)](https://aws.amazon.com/about-aws/whats-new/2016/11/introducing-the-aws-serverless-application-model/). An [AWS CloudFormation](https://aws.amazon.com/cloudformation/) extension to simplify Stack-definitions of Serverless Applications. You can find the [latest SAM template specification here](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md).

The whole stack is basically a list of resources. All resources are defined in `src/resources/`. Every single resource **requires** a `template.js` file which exports a [AWS SAM resource definition](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#resource-types)! If the resource is a AWS Lambda function then there should be a `lambda` directory containing the lambda function itself and all other modules, assets, etc. that are **only** required by the function. E.g. `src/resources/<myResource>/lambda/index.js`. Please check the [AWS Lambda Getting Started Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) for more details about Lambda functions.

Lambdas can be written in ES6 including [async](https://github.com/tc39/ecmascript-asyncawait) functions. We Transform and bundle the Lambda function with [webpack](https://webpack.github.io/) and [babel](https://babeljs.io/) using the [latest preset](https://babeljs.io/docs/plugins/preset-latest/). See the `.babelrc` file for details.  
Check the [compat-table](https://kangax.github.io/compat-table/es6/) for more details about which ES6/ES7 features are supported or not.


#### Resources with AWS::Serverless::Api Events

AWS SAM does not support CORS out of the box (yet). But it is possible to add CORS with a seperate Swagger api definition. There is a   [api_swagger_cors](https://github.com/awslabs/serverless-application-model/tree/master/examples/2016-10-31/api_swagger_cors) example you should check. **But you have to do one more thing to make it work.** For each Lambda that has a Serverless::Api event you must specify a [AWS::Lambda::Permission](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-permission.html) resource. Our [GraphQL resource](https://github.com/kreuzwerker/DKT.flows-engine/blob/master/src/resources/graphql/template.js#L45) is a working example for that.


#### Styleguide

We **strongly recommend** to install a realtime linter extension to your Editor. Otherwise you have to run `npm run lint` all the time.
We're using [ESLint](http://eslint.org/) with a slightly modified version of the [Airbnb styleguide](https://github.com/airbnb/javascript). Check the `.eslintrc` file for details.
