import { DbConnection } from "../../../interfaces/DBConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { CommentInstance } from "../../../models/CommentModel";
import { Transaction } from "sequelize";
import { handleError, throwError } from "../../../utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

export const commentResolvers = {

    Comment: {

        user: (
            comment: CommentInstance,
            args,
            { db, dataLoaders: { userLoader } }: { db: DbConnection, dataLoaders: DataLoaders },
            info: GraphQLResolveInfo
        ) => {

            /**
             *  Using data loaders to get the data in batch
             */
            return userLoader
                .load(comment.get('user'))
                .catch(handleError);

            // return db.User
            //     .findById(comment.get('user'))
            //     .catch(handleError);
        },

        post: (
            comment: CommentInstance,
            args,
            { db, dataLoaders: { postLoader } }: { db: DbConnection, dataLoaders: DataLoaders },
            info: GraphQLResolveInfo
        ) => {

            return postLoader
                .load(comment.get('post'))
                .catch(handleError);

            // return db.Post
            //     .findById(comment.get('post'))
            //     .catch(handleError);
        }
    },

    Query: {

        commentsByPost: (
            parent,
            { postId, first = 10, offset = 0 },
            context: ResolverContext,
            info: GraphQLResolveInfo
        ) => {

            postId = parseInt(postId);

            return context.db.Comment
                .findAll({
                    where: { post: postId },
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info)
                })
                .catch(handleError);
        } 
    },

    Mutation: {

        createComment: compose(...authResolvers)((
            parent,
            { input },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
        ) => {
            
            return db.sequelize.transaction(
                (transaction: Transaction) => {
                    
                    input.user = authUser.id;
                    return db.Comment.create(input, { transaction });
                }
            )
            .catch(handleError);
        }),

        updateComment: compose(...authResolvers)((
            parent,
            { id, input },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction((transaction: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {

                        input.user = authUser.id;
                        throwError(!comment, `Comment with id ${ id } not found.`);
                        throwError(comment.get('user') != authUser.id, `Unaunthorized!`);

                        return comment.update(input, { transaction });
                    });
            })
            .catch(handleError);
        }),

        deleteComment: compose(...authResolvers)((
            parent,
            { id },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction((transaction: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {

                        throwError(!comment, `Comment with id ${ id } not found.`);
                        throwError(comment.get('user') != authUser.id, `Unaunthorized!`);
                        
                        return comment
                            .destroy({ transaction })
                            .then(() => true);
                    })
            })
            .catch(handleError);
        })
    }
}