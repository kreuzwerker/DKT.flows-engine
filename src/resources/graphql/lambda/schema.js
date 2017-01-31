import {
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType
} from 'graphql'
import * as Flows from './resolvers/flows'
import * as Providers from './resolvers/providers'
import * as Services from './resolvers/services'
import * as Steps from './resolvers/steps'


const FlowType = new GraphQLObjectType({
  name: 'Flow',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    steps: {
      type: new GraphQLList(StepType), // eslint-disable-line
      resolve: f => (f.steps ? Steps.batchGetStepByIds(f.steps) : [])
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
      resolve: p => (p.services ? Services.batchGetServicesByIds(p.services) : [])
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
      resolve: s => (s.provider ? Providers.getProviderById(s.provider) : null)
    },
    step: {
      type: StepType, // eslint-disable-line
      resolve: s => (s.step ? Steps.getStepById(s.step) : null)
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
      resolve: s => (s.flow ? Flows.getFlowById(s.flow) : null)
    },
    service: {
      type: ServiceType,
      resolve: s => (s.service ? Services.getServiceById(s.service) : null)
    }
  })
})


const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allFlows: {
      type: new GraphQLList(FlowType),
      resolve: Flows.RootQueries.allFlows
    },
    Flow: {
      type: FlowType,
      args: { id: { type: GraphQLString } },
      resolve: Flows.RootQueries.flow
    },

    allProviders: {
      type: new GraphQLList(ProviderType),
      resolve: Providers.RootQueries.allProviders
    },
    Provider: {
      type: ProviderType,
      args: { id: { type: GraphQLString } },
      resolve: Providers.RootQueries.provider
    },

    allServices: {
      type: new GraphQLList(ServiceType),
      resolve: Services.RootQueries.allServices
    },
    Service: {
      type: ServiceType,
      args: { id: { type: GraphQLString } },
      resolve: Services.RootQueries.service
    },

    allSteps: {
      type: new GraphQLList(StepType),
      resolve: Steps.RootQueries.allSteps
    },
    Steps: {
      type: StepType,
      args: { id: { type: GraphQLString } },
      resolve: Steps.RootQueries.step
    }
  })
})


export default new GraphQLSchema({
  query: QueryType
})
