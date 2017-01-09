# DKT.flows-engine Deployment

#### Lambdas

```shell
Usage: cli/dkt lambda deploy [options]

Deploy Functions zip to AWS Lambda

Options:

  -h, --help             output usage information
  -f, --function <name>  only one function
  -F, --file             path to directory with the zip file - default: <path/to/repository>/dist/
  -v, --verbose          verbose output
```

e.g. `$ cli/dkt lambda deploy -v -f fetchArticle`

#### StepFunctions

```shell
Usage: cli/dkt stepfunctions deploy [options]

Deploy Workflows

Options:

  -h, --help             output usage information
  -w, --workflow <name>  only one workflow
  -v, --verbose          verbose output
```

e.g. `$ cli/dkt stepfunctions deploy -v -w articleTest`


#### ApiGateway

```shell
Usage: cli/dkt api deploy [options]

Update ApiGateway

Options:

  -h, --help          output usage information
  -s, --stage <name>  stage to deploy - required!
  -v, --verbose       verbose output
```

e.g. `$ cli/dkt api deploy -v -s test`
