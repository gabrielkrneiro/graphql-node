"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commentTypes = `

    type Comment {
        id: ID!
        comment: String!
        createdAt: String!
        updatedAt: String!
        user: User!
        post: Post!
    }

    input CommentInput {

        comment: String!
        post : Int!
        user: Int!
    }
`;
exports.commentTypes = commentTypes;
const commentQuerys = `
    commentsByPost(post: ID!, first: Int, offset: Int): [ Comment! ]!
`;
exports.commentQuerys = commentQuerys;
const commentMutations = `
    createComment(input: CommentInput!): Comment
    updateComment(id: ID!, input: CommentInput!): Comment
    deleteComment(id: ID!): Boolean
`;
exports.commentMutations = commentMutations;
