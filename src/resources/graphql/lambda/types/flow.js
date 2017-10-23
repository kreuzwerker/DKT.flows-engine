import {
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql'
import { StepType } from './step'
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
    stateMachineArn: { type: GraphQLString },
    steps: {
      type: new GraphQLList(StepType),
      resolve: (flow) => {
        if (!flow.steps || flow.steps.length === 0) return []
        return Steps.batchGetStepByIds(flow.steps)
      }
    },
    flowRuns: {
      type: new GraphQLList(FlowRunType),
      resolve: (flow) => {
        return FlowRun.getFlowRunsByFlowId(flow.id)
      }
    }
  })
})
