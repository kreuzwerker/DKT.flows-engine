import {
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType
} from 'graphql'
import * as Resolvers from './resolvers'


const FlowType = new GraphQLObjectType({
  name: 'Flow',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    steps: {
      type: new GraphQLList(StepType), // eslint-disable-line
      resolve: Resolvers.flow.steps
    }
  })
})


const ProviderType = new GraphQLObjectType({
  name: 'Provider',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    group: { type: GraphQLString },
    description: { type: GraphQLString },
    icon: { type: GraphQLString },
    services: {
      type: new GraphQLList(ServiceType), // eslint-disable-line
      resolve: Resolvers.provider.services
    }
  })
})


const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    type: { type: GraphQLString },
    provider: {
      type: ProviderType,
      resolve: Resolvers.service.provider
    },
    step: {
      type: StepType, // eslint-disable-line
      resolve: Resolvers.service.step
    }
  })
})


const StepType = new GraphQLObjectType({
  name: 'Step',
  fields: () => ({
    id: { type: GraphQLID },
    position: { type: GraphQLString },
    description: { type: GraphQLString },
    flow: {
      type: FlowType,
      resolve: Resolvers.step.flow
    },
    service: {
      type: ServiceType,
      resolve: Resolvers.step.service
    }
  })
})


const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allFlows: {
      type: new GraphQLList(FlowType),
      resolve: Resolvers.Query.allFlows
    },
    Flow: {
      type: FlowType,
      args: { id: { type: GraphQLString } },
      resolve: Resolvers.Query.flow
    },

    allProviders: {
      type: new GraphQLList(ProviderType),
      resolve: Resolvers.Query.appProvider
    },
    Provider: {
      type: ProviderType,
      args: { id: { type: GraphQLString } },
      resolve: Resolvers.Query.provider
    },

    allServices: {
      type: new GraphQLList(ServiceType),
      resolve: Resolvers.Query.allServices
    },
    Service: {
      type: ServiceType,
      args: { id: { type: GraphQLString } },
      resolve: Resolvers.Query.service
    },

    allSteps: {
      type: new GraphQLList(StepType),
      resolve: Resolvers.Query.allSteps
    },
    Steps: {
      type: StepType,
      args: { id: { type: GraphQLString } },
      resolve: Resolvers.Query.steps
    }
  })
})


export default new GraphQLSchema({
  query: QueryType
})
