import {
  GraphQLSchema,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
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
      resolve: Flows.allFlows
    },
    Flow: {
      type: FlowType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => Flows.getFlowById(id)
    },

    allProviders: {
      type: new GraphQLList(ProviderType),
      resolve: Providers.allProviders
    },
    Provider: {
      type: ProviderType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => Providers.getProviderById(id)
    },

    allServices: {
      type: new GraphQLList(ServiceType),
      resolve: Services.allServices
    },
    Service: {
      type: ServiceType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => Services.getServiceById(id)
    },

    allSteps: {
      type: new GraphQLList(StepType),
      resolve: Steps.allSteps
    },
    Steps: {
      type: StepType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => Steps.getStepById(id)
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
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        steps: { type: new GraphQLList(GraphQLID) }
      },
      resolve: (_, flow) => Flows.createFlow(flow)
    },
    updateFlow: {
      type: FlowType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        steps: { type: new GraphQLList(GraphQLID) }
      },
      resolve: (_, flow) => Flows.updateFlow(flow)
    },
    deleteFlow: {
      type: FlowType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Flows.deleteFlow(id)
    },

    createProvider: {
      type: ProviderType,
      args: {
        name: { type: GraphQLString },
        group: { type: GraphQLString },
        description: { type: GraphQLString },
        icon: { type: GraphQLString },
        services: { type: new GraphQLList(GraphQLID) }
      },
      resolve: (_, provider) => Providers.createProvider(provider)
    },
    updateProvider: {
      type: ProviderType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        group: { type: GraphQLString },
        description: { type: GraphQLString },
        icon: { type: GraphQLString },
        services: { type: new GraphQLList(GraphQLID) }
      },
      resolve: (_, provider) => Providers.updateProvider(provider)
    },
    deleteProvider: {
      type: ProviderType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Providers.deleteProvider(id)
    },

    createService: {
      type: ServiceType,
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        type: { type: GraphQLString },
        provider: { type: GraphQLID },
        step: { type: GraphQLID }
      },
      resolve: (_, service) => Services.createService(service)
    },
    updateService: {
      type: ServiceType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        type: { type: GraphQLString },
        provider: { type: GraphQLID },
        step: { type: GraphQLID }
      },
      resolve: (_, service) => Services.updateService(service)
    },
    deleteService: {
      type: ServiceType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Services.deleteService(id)
    },

    createStep: {
      type: StepType,
      args: {
        position: { type: GraphQLInt },
        description: { type: GraphQLString },
        flow: { type: GraphQLID },
        service: { type: GraphQLID }
      },
      resolve: (_, step) => Steps.createStep(step)
    },
    updateStep: {
      type: StepType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        position: { type: GraphQLInt },
        description: { type: GraphQLString },
        flow: { type: GraphQLID },
        service: { type: GraphQLID }
      },
      resolve: (_, step) => Steps.updateStep(step)
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
