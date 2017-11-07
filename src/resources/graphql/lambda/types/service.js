import {
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLNonNull
} from 'graphql'
import { ProviderType } from './provider'
import * as Providers from '../resolvers/providers'

const SelectOptionsType = new GraphQLObjectType({
  name: 'OptionsType',
  fields: () => ({
    label: { type: GraphQLString },
    value: { type: GraphQLString }
  })
})

const ServiceConfigSchemaType = new GraphQLObjectType({
  name: 'ServiceConfigSchema',
  fields: () => ({
    fieldId: { type: new GraphQLNonNull(GraphQLID) },
    position: { type: GraphQLInt },
    label: { type: GraphQLString },
    type: { type: GraphQLString },
    defaultValue: { type: GraphQLString },
    required: { type: GraphQLBoolean },
    options: { type: new GraphQLList(SelectOptionsType) }
  })
})

export const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    type: { type: GraphQLString },
    task: { type: GraphQLBoolean },
    taskType: { type: GraphQLString },
    arn: { type: GraphQLString },
    activityArn: { type: GraphQLString },
    taskToken: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: {
      type: ProviderType,
      resolve: (service) => {
        if (!service.provider) return null
        return Providers.getProviderById(service.provider)
      }
    },
    configSchema: { type: new GraphQLList(ServiceConfigSchemaType) },
    samplePayload: { type: GraphQLString }
  })
})
