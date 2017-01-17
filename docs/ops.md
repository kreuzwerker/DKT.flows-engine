# DKT.flows-engine Deployment

#### Stack

```shell
Usage: cli/dkt stack deploy [options]

Deploy Application Stack

Options:

  -h, --help     output usage information
  -v, --verbose  verbose output
```

e.g. `$ cli/dkt stack deploy -v`


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
