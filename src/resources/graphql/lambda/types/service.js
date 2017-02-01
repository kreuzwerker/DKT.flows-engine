import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql'
import { ProviderType } from './provider'
import { StepType } from './step'
import * as Steps from '../resolvers/steps'
import * as Providers from '../resolvers/providers'


export const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    type: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: {
      type: ProviderType,
      resolve: (service) => {
        if (!service.provider) return null
        return Providers.getProviderById(service.provider)
      }
    },
    step: {
      type: StepType, // eslint-disable-line
      resolve: (service) => {
        if (!service.step) return null
        return Steps.getStepById(service.step)
      }
    }
  })
})


export const ServiceInputType = new GraphQLInputObjectType({
  name: 'ServiceInput',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    type: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: { type: GraphQLID },
    step: { type: GraphQLID } // eslint-disable-line
  })
})
