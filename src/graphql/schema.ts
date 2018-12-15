import { makeExecutableSchema }  from 'graphql-tools';
import gql from 'graphql-tag';

import { Query } from './query';
import { Mutation } from './mutation';
import { userTypes } from './resources/user/user.schema';
import { postTypes } from './resources/post/post.schema';

const SchemaDefinition = `
    type Schema {
        query: Query,
        mutation: Mutation
    }
`;

export default makeExecutableSchema({
    typeDefs: [
        SchemaDefinition,
        Query,
        Mutation,
        userTypes,
        postTypes
    ]
 });