"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const users = [
    {
        id: 1,
        name: 'john',
        email: 'john@email.com'
    }
];
const typeDefs = `
    type User {
       
        id: ID!
        name: String!
        email: String!
    }

    type Query {
       
        allUsers: [User!]!
    }

    type Mutation {

        createUser(
            name: String!
            email: String!
        ) : User
    }
`;
const resolvers = {
    User: {
        id: (parent) => parent.id,
        name: (parent) => parent.name,
        email: (parent) => parent.email
    },
    Query: {
        allUsers: () => users
    },
    Mutation: {
        createUser: (parent, args) => {
            /**
             * ou const newUser = Object.assign({id: users.length + 1}, args)
             */
            const newUser = {
                id: users.length + 1,
                name: args.name,
                email: args.email
            };
            users.push(newUser);
            return newUser;
        }
    }
};
exports.default = graphql_tools_1.makeExecutableSchema({ typeDefs, resolvers });
