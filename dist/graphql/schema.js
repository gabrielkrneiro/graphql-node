"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const lodash_1 = require("lodash");
const query_1 = require("./query");
const mutation_1 = require("./mutation");
const user_schema_1 = require("./resources/user/user.schema");
const post_schema_1 = require("./resources/post/post.schema");
const comment_schema_1 = require("./resources/comment/comment.schema");
const comment_resolvers_1 = require("./resources/comment/comment.resolvers");
const post_resolvers_1 = require("./resources/post/post.resolvers");
const user_resolvers_1 = require("./resources/user/user.resolvers");
const token_schema_1 = require("./resources/token/token.schema");
const token_resolvers_1 = require("./resources/token/token.resolvers");
/*
*   usando lodash pra mesclar os resolvers dos nossos resources
*   fazendo o const resolvers um unico objeto com todos os Querys,
*   Mutations e Trivial Querys
*/
const resolvers = lodash_1.merge(comment_resolvers_1.commentResolvers, post_resolvers_1.postResolvers, token_resolvers_1.tokenResolvers, user_resolvers_1.userResolvers);
const SchemaDefinition = `
    type Schema {
        query: Query,
        mutation: Mutation
    }
`;
exports.default = graphql_tools_1.makeExecutableSchema({
    typeDefs: [
        SchemaDefinition,
        query_1.Query,
        mutation_1.Mutation,
        user_schema_1.userTypes,
        post_schema_1.postTypes,
        comment_schema_1.commentTypes,
        token_schema_1.tokenTypes
    ],
    resolvers
});
