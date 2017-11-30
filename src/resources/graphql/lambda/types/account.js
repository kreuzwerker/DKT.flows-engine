import { GraphQLID, GraphQLString, GraphQLObjectType, GraphQLNonNull } from 'graphql'

export const AccountType = new GraphQLObjectType({
  name: 'Account',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    accountType: { type: GraphQLString },
    key: { type: GraphQLString },
    userId: { type: GraphQLString }
  })
})
