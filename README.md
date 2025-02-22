# DKT.flows-engine

## Requirements

#### [Node](https://nodejs.org/en/)

All the tools and Scripts are written in JavaScript (>ES6). This means you have to install Node. We
Support every **Node Version >= 8.9.0.** (since this is the latest
[Long-term Support Version](https://github.com/nodejs/LTS)).\
You can install node via [NVM](https://github.com/creationix/nvm), [Homebrew](http://brew.sh/) (on macOS)
or you download a installer from [nodejs.org/](https://nodejs.org/).

* NVM: `nvm install 8.9.0` _(recommended)_
* brew: `brew install node`

When you have to change the node version from time to time (e.g. for different projects) then you
can run `$ nvm use` when entering the project directory. This will select the node version defined
within the `.nvmrc` file. Or you add
[this code snipped (link)](https://github.com/creationix/nvm#zsh) to your `.zshrc` or `.bashrc`.

#### [AWS](https://aws.amazon.com/documentation/)

If you want to interact with AWS (deploying, ... etc.) then you have to define a
[named Profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-multiple-profiles)
`[DKT]` within your `~/.aws/credentials` file.

```
[DKT]
aws_access_key_id = <yourAccessKey>
aws_secret_access_key = <yourSecretAccessKey>
```

## Command line tool `cli/dkt`

This Project comes with a small command line tool to build, bundle, test and deploy the flow-engine
stack and StepFunctions!

```shell
Usage: cli/dkt [options] [command]


  Commands:

    stack [command]          deploy stack
    stepfunctions [command]  start step functions
    test [command]           run tests
    help [cmd]               display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## [Development](https://github.com/kreuzwerker/DKT.flows-engine/blob/master/docs/dev.md)

## [Testing](https://github.com/kreuzwerker/DKT.flows-engine/blob/master/docs/tests.md)

## [Deployment](https://github.com/kreuzwerker/DKT.flows-engine/blob/master/docs/ops.md)
