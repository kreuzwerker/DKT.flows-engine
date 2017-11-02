import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList
} from 'graphql'
import { FlowType } from './flow'
import { getRuns } from '../resolvers/flowRuns'
import { getFlowById } from '../resolvers/flows'

const StepLogType = new GraphQLObjectType({
  name: 'StepLogType',
  fields: () => ({
    id: { type: GraphQLID },
    position: { type: GraphQLInt },
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    timestamp: { type: GraphQLString }
  })
})

const LogsType = new GraphQLObjectType({
  name: 'LogsType',
  fields: () => ({
    steps: { type: new GraphQLList(StepLogType) }
  })
})

export const RunsType = new GraphQLObjectType({
  name: 'RunsType',
  fields: () => ({
    id: { type: GraphQLID },
    status: { type: GraphQLString },
    logs: { type: LogsType },
    result: { type: GraphQLString },
    startedAt: { type: GraphQLString },
    finishedAt: { type: GraphQLString }
  })
})

export const FlowRunType = new GraphQLObjectType({
  name: 'FlowRun',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLID },
    stateMachineArn: { type: GraphQLString },
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    flow: {
      type: FlowType,
      resolve: flowRun => getFlowById(flowRun.flow.id)
    },
    runs: {
      type: new GraphQLList(RunsType),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        status: { type: GraphQLString }
      },
      resolve: getRuns
    },
    runsCount: { type: GraphQLInt },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})
