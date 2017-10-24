import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLEnumType
} from 'graphql'
import { FlowType } from './flow'
import { FlowRunType } from './flowRun'

// TODO UPDATE TASK DATA

const TaskState = new GraphQLEnumType({
  name: 'TaskState',
  values: {
    NOT_STARTED: { value: 'NOT_STARTED' },
    STARTED: { value: 'STARTED' },
    PAUSED: { value: 'PAUSED' },
    FINISHED: { value: 'FINISHED' },
    APPROVED: { value: 'APPROVED' },
    REJECTED: { value: 'REJECTED' },
    REVIEWED: { value: 'REVIEWED' }
  }
})

const TaskTypeType = new GraphQLEnumType({
  name: 'TaskTypeType',
  values: {
    REVIEW: { value: 'REVIEW' },
    APPROVE: { value: 'APPROVE' },
    CORRECT: { value: 'CORRECT' }
  }
})

const CommentsType = new GraphQLObjectType({
  name: 'CommentsType',
  fields: () => ({
    date: { type: GraphQLString },
    comment: { type: GraphQLString }
  })
})

export const TaskType = new GraphQLObjectType({
  name: 'TaskType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    date: { type: GraphQLString },
    type: { type: TaskTypeType },
    state: { type: TaskState },
    activityArn: { type: GraphQLString },
    taskToken: { type: GraphQLString },
    flow: { type: FlowRunType }, // legacy
    flowRun: { type: FlowRunType },
    currentStep: { type: GraphQLInt },
    input: { type: GraphQLString },
    comments: { type: new GraphQLList(CommentsType) },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})

export const TaskItemType = new GraphQLObjectType({
  name: 'TaskItemType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    data: { type: GraphQLString },
    type: { type: GraphQLString }
  })
})
