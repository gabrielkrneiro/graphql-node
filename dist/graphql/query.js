"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_schema_1 = require("./resources/post/post.schema");
const user_schema_1 = require("./resources/user/user.schema");
const comment_schema_1 = require("./resources/comment/comment.schema");
const Query = `
    type Query {
        ${post_schema_1.postQueries}
        ${user_schema_1.userQueries}
        ${comment_schema_1.commentQuerys}
    }
`;
exports.Query = Query;
