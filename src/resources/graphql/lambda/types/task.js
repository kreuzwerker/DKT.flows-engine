import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLEnumType
} from 'graphql'
import { FlowRunMirrorType } from './flowRun'

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
    taskToken: { type: GraphQLString },
    flow: { type: FlowRunMirrorType },
    currentStep: { type: GraphQLInt },
    input: { type: GraphQLString },
    comments: { type: new GraphQLList(CommentsType) },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})

export const TaskMirrorType = new GraphQLObjectType({
  name: 'TaskMirrorType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    date: { type: GraphQLString },
    type: { type: TaskTypeType },
    state: { type: TaskState },
    taskToken: { type: GraphQLString },
    flow: { type: FlowRunMirrorType },
    currentStep: { type: GraphQLInt },
    input: { type: GraphQLString },
    comments: { type: new GraphQLList(CommentsType) },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})
