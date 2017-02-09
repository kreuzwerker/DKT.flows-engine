import {
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql'
import { FlowType } from './flow'
import { ServiceType } from './service'
import * as Flows from '../resolvers/flows'
import * as Services from '../resolvers/services'


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
      resolve: (step) => {
        if (!step.flow) return null
        return Flows.getFlowById(step.flow)
      }
    },
    service: {
      type: ServiceType,
      resolve: (step) => {
        if (!step.service) return null
        return Services.getServiceById(step.service)
      }
    }
  })
})


export const StepInputType = new GraphQLInputObjectType({
  name: 'StepInput',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    position: { type: GraphQLInt },
    description: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    flow: { type: GraphQLID },
    service: { type: GraphQLID }
  })
})
