import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList
} from 'graphql'
import { FlowMirrorType } from './flow'
import { getRuns } from '../resolvers/flowRuns'


const StepLogType = new GraphQLObjectType({
  name: 'StepLogType',
  fields: () => ({
    id: { type: GraphQLID },
    position: { type: GraphQLInt },
    status: { type: GraphQLString },
    message: { type: GraphQLString }
  })
})


const LogsType = new GraphQLObjectType({
  name: 'LogsType',
  fields: () => ({
    steps: { type: new GraphQLList(StepLogType) }
  })
})


const RunsType = new GraphQLObjectType({
  name: 'RunsType',
  fields: () => ({
    id: { type: GraphQLID },
    status: { type: GraphQLString },
    logs: { type: LogsType }
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
    flow: { type: FlowMirrorType },
    runs: {
      type: new GraphQLList(RunsType),
      resolve: getRuns
    },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})
