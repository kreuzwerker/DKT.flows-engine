import { GraphQLID, GraphQLList, GraphQLString, GraphQLObjectType, GraphQLNonNull } from 'graphql'
import { ServiceType } from './service'
import * as Services from '../resolvers/services'

export const ProviderType = new GraphQLObjectType({
  name: 'Provider',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    group: { type: GraphQLString },
    description: { type: GraphQLString },
    icon: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    services: {
      type: new GraphQLList(ServiceType),
      resolve: (provider) => {
        if (!provider.services || provider.services.length === 0) return []
        return Services.batchGetServicesByIds(provider.services)
      }
    }
  })
})
