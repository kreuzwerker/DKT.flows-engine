import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLEnumType
} from 'graphql'
import { StepMirrorType } from './step'

// TODO UPDATE TASK DATA

const StateType = new GraphQLEnumType({
  name: 'State',
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

export const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    state: { type: StateType },
    taskToken: { type: GraphQLString },
    step: { type: StepMirrorType },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})

export const TaskMirrorType = new GraphQLObjectType({
  name: 'TaskInput',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    taskToken: { type: GraphQLString },
    step: { type: StepMirrorType },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    provider: { type: GraphQLID }
  })
})
