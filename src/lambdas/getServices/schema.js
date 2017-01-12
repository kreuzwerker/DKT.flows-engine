import {
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType
} from 'graphql'
import * as Resolvers from './resolvers'


const S3Content = new GraphQLObjectType({
  name: 'S3Content',
  fields: () => ({
    Key: { type: GraphQLString },
    LastModified: { type: GraphQLString },
    Size: { type: GraphQLString }
  })
})


const S3Type = new GraphQLObjectType({
  name: 'S3',
  fields: () => ({
    Bucket: { type: GraphQLString },
    Prefix: { type: GraphQLString },
    Contents: {
      type: new GraphQLList(S3Content),
      args: {
        Bucket: { type: GraphQLString },
        Prefix: { type: GraphQLString }
      },
      resolve: Resolvers.s3.content
    }
  })
})


const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: () => ({
    FunctionName: { type: GraphQLString },
    FunctionArn: { type: GraphQLString },
    Runtime: { type: GraphQLString },
    Description: { type: GraphQLString },
    LastModified: { type: GraphQLString },
    Output: {
      type: S3Type,
      args: {
        FunctionName: { type: GraphQLString }
      },
      resolve: Resolvers.s3.info
    }
  })
})


const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    services: {
      type: new GraphQLList(ServiceType),
      resolve: Resolvers.Query.services
    },
    service: {
      type: ServiceType,
      args: {
        FunctionName: { type: GraphQLString }
      },
      resolve: Resolvers.Query.service
    }
  })
})


export default new GraphQLSchema({
  query: QueryType
})
