import { GraphQLString, GraphQLObjectType } from 'graphql'

export const AboutType = new GraphQLObjectType({
  name: 'About',
  fields: () => ({
    branch: { type: GraphQLString },
    hash: { type: GraphQLString },
    message: { type: GraphQLString }
  })
})
