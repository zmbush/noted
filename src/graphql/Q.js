import * as gql from 'graphql';

export default {
  Schema: gql.GraphQLSchema,

  ScalarType: gql.GraphQLScalarType,
  ObjectType: gql.GraphQLObjectType,
  InterfaceType: gql.GraphQLInterfaceType,
  UnionType: gql.GraphQLUnionType,
  EnumType: gql.GraphQLEnumType,
  InputObjectType: gql.GraphQLInputObjectType,
  List: gql.GraphQLList,
  NonNull: gql.GraphQLNonNull,

  Int: gql.GraphQLInt,
  Float: gql.GraphQLFloat,
  String: gql.GraphQLString,
  Boolean: gql.GraphQLBoolean,
  ID: gql.GraphQLID,
};
