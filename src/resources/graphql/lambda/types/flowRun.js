import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull
} from 'graphql'
import { FlowMirrorType } from './flow'


export const FlowRunType = new GraphQLObjectType({
  name: 'FlowRun',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    currentState: { type: GraphQLString },
    flow: { type: FlowMirrorType },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
})
