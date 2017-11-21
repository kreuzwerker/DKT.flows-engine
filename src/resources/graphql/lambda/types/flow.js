import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql'
import _isString from 'lodash/isString'
import { StepType } from './step'
import * as Steps from '../resolvers/steps'
import { FlowRunType, RunsType } from './flowRun'
import * as FlowRun from '../resolvers/flowRuns'

export const FlowType = new GraphQLObjectType({
  name: 'Flow',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    draft: { type: GraphQLBoolean },
    active: { type: GraphQLBoolean },
    triggerType: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    stateMachineArn: { type: GraphQLString }, // depricated
    userId: { type: GraphQLID },
    steps: {
      type: new GraphQLList(StepType),
      resolve: (flow) => {
        if (!flow.steps || flow.steps.length === 0) return []
        if (_isString(flow.steps[0])) {
          return Steps.batchGetStepByIds(flow.steps)
        }
        return flow.steps
      }
    },
    flowRuns: {
      type: new GraphQLList(FlowRunType),
      resolve: flow => FlowRun.getFlowRunsByFlowId(flow.id)
    },
    lastFlowRun: {
      type: FlowRunType,
      resolve: flow => FlowRun.getLastFlowRunByFlowId(flow.id)
    },
    runs: {
      type: new GraphQLList(RunsType),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        status: { type: GraphQLString }
      },
      resolve: FlowRun.getRunsForFlow
    },
    runsCount: {
      type: GraphQLInt,
      args: {
        status: { type: GraphQLString }
      },
      resolve: FlowRun.getRunsForFlowCount
    }
  })
})
