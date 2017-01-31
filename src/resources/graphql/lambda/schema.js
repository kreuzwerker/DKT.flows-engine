import {
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql'
import * as Flows from './resolvers/flows'
import * as Providers from './resolvers/providers'
import * as Services from './resolvers/services'
import * as Steps from './resolvers/steps'


/**
 * ---- Types ------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

const FlowType = new GraphQLObjectType({
  name: 'Flow',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    steps: {
      type: new GraphQLList(StepType), // eslint-disable-line
      resolve: (flow) => {
        if (!flow.steps || flow.steps.length === 0) return []
        return Steps.batchGetStepByIds(flow.steps)
      }
    }
  })
})

const FlowInputType = new GraphQLInputObjectType({
  name: 'FlowInput',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    steps: { type: new GraphQLList(GraphQLID) } // eslint-disable-line
  })
})


const ProviderType = new GraphQLObjectType({
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
      type: new GraphQLList(ServiceType), // eslint-disable-line
      resolve: (provider) => {
        if (!provider.services || provider.services.length === 0) return []
        return Services.batchGetServicesByIds(provider.services)
      }
    }
  })
})

const ProviderInputType = new GraphQLInputObjectType({
  name: 'ProviderInput',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    group: { type: GraphQLString },
    description: { type: GraphQLString },
    icon: { type: GraphQLString },
    services: { type: new GraphQLList(GraphQLID) } // eslint-disable-line
  })
})


const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: () => ({
    id: { type: GraphQLID },
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


const StepType = new GraphQLObjectType({
  name: 'Step',
  fields: () => ({
    id: { type: GraphQLID },
    position: { type: GraphQLString },
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
    // deleteFlow: { /* TODO */ },

    createProvider: {
      type: ProviderType,
      args: {
        provider: { type: ProviderInputType }
      },
      resolve: (_, { provider }) => Providers.createProvider(provider)
    }
    // updateProvider: { /* TODO */ },
    // deleteProvider: { /* TODO */ },

    // createService: { /* TODO */ },
    // updateService: { /* TODO */ },
    // deleteService: { /* TODO */ },

    // createStep: { /* TODO */ },
    // updateStep: { /* TODO */ },
    // deleteStep: { /* TODO */ }
  })
})


/**
 * ---- Actual Schema ----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default new GraphQLSchema({ query: QueryType, mutation: MutationType })
