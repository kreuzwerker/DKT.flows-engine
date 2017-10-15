import { GraphQLID, GraphQLList, GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLBoolean } from 'graphql'
import { StepType, StepMirrorType } from './step'
import * as Steps from '../resolvers/steps'
import { FlowRunType } from './flowRun'
import * as FlowRun from '../resolvers/flowRuns'

export const FlowType = new GraphQLObjectType({
  name: 'Flow',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    draft: { type: GraphQLBoolean },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    steps: {
      type: new GraphQLList(StepType),
      resolve: (flow) => {
        if (!flow.steps || flow.steps.length === 0) return []
        return Steps.batchGetStepByIds(flow.steps)
      }
    },
    flowRun: {
      type: FlowRunType,
      resolve: (flow) => {
        return FlowRun.getFlowRunByFlowId(flow.id);
      }
    },
  })
})

export const FlowMirrorType = new GraphQLObjectType({
  name: 'FlowMirror',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    draft: { type: GraphQLBoolean },
    steps: { type: new GraphQLList(StepMirrorType) }
  })
})
