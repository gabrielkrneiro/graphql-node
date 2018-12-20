import { DbConnection } from "../../../interfaces/DBConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { CommentInstance } from "../../../models/CommentModel";
import { Transaction } from "sequelize";
import { handleError } from "../../../utils";

export const commentResolvers = {

    Comment: {

        user: (
            comment: CommentInstance,
            args,
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.User
                .findById(comment.get('user'))
                .catch(handleError);
        },

        post: (
            comment: CommentInstance,
            args,
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.Post
                .findById(comment.get('post'))
                .catch(handleError);
        }
    },

    Query: {

        commentsByPost: (
            parent,
            { postId, first = 10, offset = 0 },
            { db } : { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            postId = parseInt(postId);

            return db.Comment
                .findAll({
                    where: { post: postId },
                    limit: first,
                    offset: offset
                })
                .catch(handleError);
        } 
    },

    Mutation: {

        createComment: (
            parent,
            { input },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {
            
            return db.sequelize.transaction(
                (transaction: Transaction) => {
                    
                    return db.Comment.create(input, { transaction });
                }
            )
            .catch(handleError);
        },

        updateComment: (
            parent,
            { id, input },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction((transaction: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {

                        if (!comment) throw new Error(`comment with id ${ id } not found`);
                        return comment.update(input, { transaction });
                    });
            })
            .catch(handleError);
        },

        deleteComment: (
            parent,
            { id },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction((transaction: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {

                        if (!comment) throw new Error(`comment with id ${ id } not found`);
                        return comment
                            .destroy({ transaction })
                            .then(() => true);
                    })
            })
            .catch(handleError);
        }
    }
}