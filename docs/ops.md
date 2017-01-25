# DKT.flows-engine Deployment

#### Stack

```shell
Usage: cli/dkt stack deploy [options]

Deploy Application Stack

Options:

  -h, --help          output usage information
  -s, --stage <name>  stage name - default: Dev
  -v, --verbose       verbose output
```

e.g. `$ cli/dkt stack deploy -s Staging -v`


##### StepFunctions

```shell
Usage: cli/dkt stepfunctions deploy [options]

Deploy Workflows

Options:

  -h, --help             output usage information
  -w, --workflow <name>  only one workflow
  -v, --verbose          verbose output
```

e.g. `$ cli/dkt stepfunctions deploy -v -w articleTest`
