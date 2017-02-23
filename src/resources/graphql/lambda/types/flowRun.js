import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull
} from 'graphql'
import { FlowType } from './flow'


export const FlowRunType = new GraphQLObjectType({
  name: 'FlowRun',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    currentState: { type: GraphQLString },
    flow: { type: FlowType },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})
