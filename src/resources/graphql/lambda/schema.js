import {
  GraphQLSchema,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull
} from 'graphql'
import { AboutType } from './types/about'
import { AccountType } from './types/account'
import { FlowType } from './types/flow'
import { FlowRunType } from './types/flowRun'
import { ProviderType } from './types/provider'
import { ServiceType } from './types/service'
import { TaskType, TaskItemType } from './types/task'
import {
  StepType,
  StepConfigParamsInputType,
  StepTestType,
  SchedulingInputType
} from './types/step'
import { about } from './resolvers/about'
import * as Accounts from './resolvers/accounts'
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
    about: {
      type: AboutType,
      resolve: about
    },

    allAccounts: {
      type: new GraphQLList(AccountType),
      resolve: (_, args, { userId }) => Accounts.allAccounts(userId)
    },
    Account: {
      type: AccountType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }, { userId }) => Accounts.getAccountById(id, userId)
    },

    allFlows: {
      type: new GraphQLList(FlowType),
      resolve: (_, variables, { userId }) => Flows.allFlows(userId)
    },
    Flow: {
      type: FlowType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }, { userId }) => Flows.queryFlow(id, userId)
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
      resolve: (_, variables, { userId }) => Tasks.allTasks(userId)
    },
    TaskItem: {
      type: TaskItemType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }, { userId }) => Tasks.queryTaskItem(id, userId)
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
    createAccount: {
      type: AccountType,
      args: {
        name: { type: GraphQLString },
        accountType: { type: GraphQLString },
        credentials: { type: GraphQLString }
      },
      resolve: (_, account, { userId }) => Accounts.createAccount(account, userId)
    },
    updateAccount: {
      type: AccountType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        accountType: { type: GraphQLString },
        credentials: { type: GraphQLString }
      },
      resolve: (_, account, { userId }) => Accounts.updateAccount(account, userId)
    },
    deleteAccount: {
      type: AccountType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }, { userId }) => Accounts.deleteAccount(id, userId)
    },

    createFlow: {
      type: FlowType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        steps: { type: new GraphQLList(GraphQLID) },
        userId: { type: GraphQLID }
      },
      resolve: (_, flow, { userId }) => Flows.createFlow(flow, userId)
    },
    updateFlow: {
      type: FlowType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        description: { type: GraphQLString },
        triggerType: { type: GraphQLString },
        steps: { type: new GraphQLList(GraphQLID) },
        userId: { type: GraphQLID }
      },
      resolve: (_, flow, { userId }) => {
        // TODO check if user is the flow owner before updating it
        // NB Updating flow properties should not put the flow into draft state
        return Flows.updateFlow(flow, false)
      }
    },
    restoreFlow: {
      type: FlowType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }, { userId }) => Flows.restoreFlow(id, userId)
    },
    deleteFlow: {
      type: FlowType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }, { userId }) => Flows.deleteFlow(id, userId)
    },

    createFlowRun: {
      type: FlowRunType,
      args: {
        flow: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: (_, flowRun, { userId }) => FlowRuns.createFlowRun(flowRun, userId)
    },
    startFlowRun: {
      type: FlowRunType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        payload: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args, { userId }) => FlowRuns.startFlowRun(args, null, userId)
    },
    createAndStartFlowRun: {
      type: FlowRunType,
      args: {
        flow: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        payload: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args, { userId }) => FlowRuns.createAndStartFlowRun(args, userId)
    },
    updateFlowRun: {
      type: FlowRunType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        active: { type: GraphQLBoolean },
        status: { type: GraphQLString },
        message: { type: GraphQLString },
        currentStep: { type: GraphQLInt }
      },
      resolve: (_, flow, { userId }) => FlowRuns.updateFlowRun(flow, userId)
    },
    deleteFlowRun: {
      type: FlowRunType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }, { userId }) => FlowRuns.deleteFlowRun(id, userId)
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
        account: { type: GraphQLID },
        position: { type: GraphQLInt },
        description: { type: GraphQLString },
        flow: { type: GraphQLID },
        service: { type: GraphQLID },
        configParams: { type: new GraphQLList(StepConfigParamsInputType) }
      },
      resolve: (_, step, { userId }) => Steps.createStep(step, userId)
    },
    updateStep: {
      type: StepType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        account: { type: GraphQLID },
        position: { type: GraphQLInt },
        description: { type: GraphQLString },
        flow: { type: GraphQLID },
        service: { type: GraphQLID },
        scheduling: { type: SchedulingInputType },
        configParams: { type: new GraphQLList(StepConfigParamsInputType) }
      },
      resolve: (_, step, { userId }) => Steps.updateStep(step, userId)
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
      resolve: (_, { id }, { userId }) => Steps.deleteStep(id, userId)
    },

    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        state: { type: GraphQLString }
      },
      resolve: (_, task, { userId }) => Tasks.updateTask(task, userId)
    },
    deleteTask: {
      type: TaskType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Tasks.deleteTask(id)
    }
  })
})

/**
 * ---- Actual Schema ----------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default new GraphQLSchema({ query: QueryType, mutation: MutationType })
