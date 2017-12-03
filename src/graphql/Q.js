// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

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
