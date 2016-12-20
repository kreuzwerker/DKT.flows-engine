# DKT.flows-engine Deployment

#### Lambdas

```shell
$ gulp lambda:deploy  # build, bundle and deploy all lambda functions
$ gulp lambda:deploy --function <functionName>  # build, bundle and deploy the one lambda function
```

#### StepFunctions

```shell
$ gulp steps:deploy --workflow <workflowNameWithoutPrefix>
```
