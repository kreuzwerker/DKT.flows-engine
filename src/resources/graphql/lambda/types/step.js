import {
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType
} from 'graphql'
import _isString from 'lodash/isString'
import { FlowType } from './flow'
import { ServiceType } from './service'
import * as Flows from '../resolvers/flows'
import * as Services from '../resolvers/services'

export const StepConfigParamsType = new GraphQLObjectType({
  name: 'StepConfigParams',
  fields: () => ({
    fieldId: { type: GraphQLID },
    value: { type: GraphQLString }
  })
})

export const StepConfigParamsInputType = new GraphQLInputObjectType({
  name: 'StepConfigParamsInput',
  fields: () => ({
    fieldId: { type: GraphQLID },
    value: { type: GraphQLString }
  })
})

export const StepType = new GraphQLObjectType({
  name: 'Step',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    position: { type: GraphQLInt },
    description: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    flow: {
      type: FlowType,
      resolve: (step, _, { userId }) => {
        if (!step.flow) return null
        return Flows.getFlowById(step.flow, userId)
      }
    },
    service: {
      type: ServiceType,
      resolve: (step) => {
        if (!step.service) return null
        if (_isString(step.service)) {
          return Services.getServiceById(step.service)
        }
        return step.service
      }
    },
    configParams: { type: new GraphQLList(StepConfigParamsType) },
    tested: { type: GraphQLBoolean }
  })
})

export const StepTestType = new GraphQLObjectType({
  name: 'StepTestType',
  fields: () => ({
    id: { type: GraphQLID },
    position: { type: GraphQLInt },
    description: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    flow: { type: GraphQLID },
    service: {
      type: ServiceType,
      resolve: (step) => {
        if (!step.service) return null
        return Services.getServiceById(step.service)
      }
    },
    configParams: { type: new GraphQLList(StepConfigParamsType) },
    result: { type: GraphQLString },
    error: { type: GraphQLString },
    tested: { type: GraphQLBoolean }
  })
})
