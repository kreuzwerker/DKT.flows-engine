import {
  GraphQLSchema,
  GraphQLList,
  GraphQLID,
  GraphQLObjectType,
  GraphQLNonNull
} from 'graphql'
import { FlowType, FlowInputType } from './types/flow'
import { ProviderType, ProviderInputType } from './types/provider'
import { ServiceType, ServiceInputType } from './types/service'
import { StepType, StepInputType } from './types/step'
import * as Flows from './resolvers/flows'
import * as Providers from './resolvers/providers'
import * as Services from './resolvers/services'
import * as Steps from './resolvers/steps'



/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allFlows: {
      type: new GraphQLList(FlowType),
      resolve: Flows.RootQueries.allFlows
    },
    Flow: {
      type: FlowType,
      args: { id: { type: GraphQLID } },
      resolve: Flows.RootQueries.flow
    },

    allProviders: {
      type: new GraphQLList(ProviderType),
      resolve: Providers.RootQueries.allProviders
    },
    Provider: {
      type: ProviderType,
      args: { id: { type: GraphQLID } },
      resolve: Providers.RootQueries.provider
    },

    allServices: {
      type: new GraphQLList(ServiceType),
      resolve: Services.RootQueries.allServices
    },
    Service: {
      type: ServiceType,
      args: { id: { type: GraphQLID } },
      resolve: Services.RootQueries.service
    },

    allSteps: {
      type: new GraphQLList(StepType),
      resolve: Steps.RootQueries.allSteps
    },
    Steps: {
      type: StepType,
      args: { id: { type: GraphQLID } },
      resolve: Steps.RootQueries.step
    }
  })
})


/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createFlow: {
      type: FlowType,
      args: { flow: { type: FlowInputType } },
      resolve: (_, { flow }) => Flows.createFlow(flow)
    },
    updateFlow: {
      type: FlowType,
      args: { flow: { type: FlowInputType } },
      resolve: (_, { flow }) => Flows.updateFlow(flow)
    },
    deleteFlow: {
      type: FlowType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Flows.deleteFlow(id)
    },

    createProvider: {
      type: ProviderType,
      args: { provider: { type: ProviderInputType } },
      resolve: (_, { provider }) => Providers.createProvider(provider)
    },
    updateProvider: {
      type: ProviderType,
      args: { provider: { type: ProviderInputType } },
      resolve: (_, { provider }) => Providers.updateProvider(provider)
    },
    deleteProvider: {
      type: ProviderType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Providers.deleteProvider(id)
    },

    createService: {
      type: ServiceType,
      args: { service: { type: ServiceInputType } },
      resolve: (_, { service }) => Services.createService(service)
    },
    updateService: {
      type: ServiceType,
      args: { service: { type: ServiceInputType } },
      resolve: (_, { service }) => Services.updateService(service)
    },
    deleteService: {
      type: ServiceType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Services.deleteService(id)
    },

    createStep: {
      type: StepType,
      args: { step: { type: StepInputType } },
      resolve: (_, { step }) => Steps.createStep(step)
    },
    updateStep: {
      type: StepType,
      args: { step: { type: StepInputType } },
      resolve: (_, { step }) => Steps.updateStep(step)
    },
    deleteStep: {
      type: StepType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Steps.deleteStep(id)
    }
  })
})


/**
 * ---- Actual Schema ----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default new GraphQLSchema({ query: QueryType, mutation: MutationType })
