import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql'
import { ProviderType } from './provider'
import * as Providers from '../resolvers/providers'


export const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    type: { type: GraphQLString },
    arn: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: {
      type: ProviderType,
      resolve: (service) => {
        if (!service.provider) return null
        return Providers.getProviderById(service.provider)
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
    arn: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: { type: GraphQLID }
  })
})


export const ServiceMirrorType = new GraphQLObjectType({
  name: 'ServiceInput',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    type: { type: GraphQLString },
    arn: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: { type: GraphQLID }
  })
})
