"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_schema_1 = require("./resources/post/post.schema");
const user_schema_1 = require("./resources/user/user.schema");
const Query = `
    type Query {
        ${post_schema_1.postQueries}
        ${user_schema_1.userQueries}
    }
`;
exports.Query = Query;
