import {
  GraphQLSchema,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull
} from 'graphql'
import { FlowType } from './types/flow'
import { FlowRunType } from './types/flowRun'
import { ProviderType } from './types/provider'
import { ServiceType } from './types/service'
import { TaskType } from './types/task'
import { StepType, StepConfigParamsInputType, StepTestType } from './types/step'
import * as Flows from './resolvers/flows'
import * as FlowRuns from './resolvers/flowRuns'
import * as Providers from './resolvers/providers'
import * as Services from './resolvers/services'
import * as Tasks from './resolvers/tasks'
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

    allFlowRuns: {
      type: new GraphQLList(FlowRunType),
      resolve: FlowRuns.allFlowRuns
    },
    FlowRun: {
      type: FlowRunType,
      args: {
        id: { type: GraphQLID },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: (_, { id }) => FlowRuns.getFlowRunById(id)
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

    allTasks: {
      type: new GraphQLList(TaskType),
      resolve: Tasks.allTasks
    },

    allSteps: {
      type: new GraphQLList(StepType),
      resolve: Steps.allSteps
    },
    Step: {
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
        id: { type: GraphQLID },
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

    createFlowRun: {
      type: FlowRunType,
      args: {
        id: { type: GraphQLID },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        flow: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: (_, flowRun) => FlowRuns.createFlowRun(flowRun)
    },
    startFlowRun: {
      type: FlowRunType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        payload: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args) => FlowRuns.startFlowRun(args)
    },
    createAndStartFlowRun: {
      type: FlowRunType,
      args: {
        flow: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        payload: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args) => FlowRuns.createAndStartFlowRun(args)
    },
    updateFlowRun: {
      type: FlowRunType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: GraphQLString },
        message: { type: GraphQLString },
        currentStep: { type: GraphQLInt }
      },
      resolve: (_, flow) => FlowRuns.updateFlowRun(flow)
    },
    deleteFlowRun: {
      type: FlowRunType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => FlowRuns.deleteFlowRun(id)
    },

    createProvider: {
      type: ProviderType,
      args: {
        id: { type: GraphQLID },
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

    createStep: {
      type: StepType,
      args: {
        id: { type: GraphQLID },
        position: { type: GraphQLInt },
        description: { type: GraphQLString },
        flow: { type: GraphQLID },
        service: { type: GraphQLID },
        configParams: { type: new GraphQLList(StepConfigParamsInputType) }
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
        service: { type: GraphQLID },
        configParams: { type: new GraphQLList(StepConfigParamsInputType) }
      },
      resolve: (_, step) => Steps.updateStep(step)
    },
    testStep: {
      type: StepTestType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        payload: { type: new GraphQLNonNull(GraphQLString) },
        configParams: { type: new GraphQLList(StepConfigParamsInputType) }
      },
      resolve: (_, { id, payload, configParams }) => Steps.testStep(id, payload, configParams)
    },
    deleteStep: {
      type: StepType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Steps.deleteStep(id)
    },

    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        state: { type: GraphQLString }
      },
      resolve: (_, task) => Tasks.updateTask(task)
    }
  })
})

/**
 * ---- Actual Schema ----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default new GraphQLSchema({ query: QueryType, mutation: MutationType })
