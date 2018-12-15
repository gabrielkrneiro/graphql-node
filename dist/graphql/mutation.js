"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_schema_1 = require("./resources/post/post.schema");
const user_schema_1 = require("./resources/user/user.schema");
const Mutation = `
    type Mutation {
        ${post_schema_1.postMutations}
        ${user_schema_1.userMutations}
    }
`;
exports.Mutation = Mutation;
