import { makeExecutableSchema }  from 'graphql-tools';

import { merge } from 'lodash';

import { Query } from './query';
import { Mutation } from './mutation';

import { userTypes } from './resources/user/user.schema';
import { postTypes } from './resources/post/post.schema';
import { commentTypes } from './resources/comment/comment.schema';
import { commentResolvers } from './resources/comment/comment.resolvers';
import { postResolvers } from './resources/post/post.resolvers';
import { userResolvers } from './resources/user/user.resolvers';

/* 
*   usando lodash pra mesclar os resolvers dos nossos resources
*   fazendo o const resolvers um unico objeto com todos os Querys,
*   Mutations e Trivial Querys
*/
const resolvers = merge(
    commentResolvers,
    postResolvers,
    userResolvers
)

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
        postTypes,
        commentTypes
    ],
    resolvers
 });