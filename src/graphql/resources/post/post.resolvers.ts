import * as graphqlFields from 'graphql-fields';

import { DbConnection } from '../../../interfaces/DBConnectionInterface';
import { GraphQLResolveInfo } from 'graphql';
import { PostInstance } from '../../../models/PostModel';
import { Transaction } from 'sequelize';
import { handleError, throwError } from '../../../utils';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { AuthUser } from '../../../interfaces/AuthUserInterface';
import { DataLoaders } from '../../../interfaces/DataLoadersInterface';
import { RequestedFields } from '../../ast/RequestedFields';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const postResolvers = {

    /**
     *  QUERY NAO TRIVIAIS
     */
    Post: {

        author: (
            post: PostInstance,
            args,
            { db, dataloaders: { userLoader } }: { db: DbConnection, dataloaders: DataLoaders },
            info: GraphQLResolveInfo
        ) => {

            return userLoader
                .load({ key: post.get('author'), info }) // id do autor
                .catch(handleError);
            /**
             *  solution bellow doesn`t returns informations in batch, and this is a problema 
             *  in a optimization point of view. `Cause this, the solution above has been implemented.
             *
             * parent == current post instance
             * aqui o author == number == author.id
             * return db.User
             *     .findById(parent.get('author'))
             *     .catch(handleError);
             */
        },

        comments: (
            parent: PostInstance,
            args,
            { db, requestedFields }: { db: DbConnection, requestedFields: RequestedFields },
            info: GraphQLResolveInfo
        ) => {

            return db.Comment
                .findAll({
                    where: { post: parent.get('id') },
                    attributes: requestedFields.getFields(info)
                })
                .catch(handleError);

        },
    },

    /**
     *  QUERY
     */
    Query: {

        posts: (
            parent,
            { first = 10, offset = 0 },
            context: ResolverContext,
            info: GraphQLResolveInfo
        ) => {

            return context.db.Post
                .findAll({
                    limit: first, 
                    offset,
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .catch(handleError);
        },

        post: (
            parent,
            { id },
            context: ResolverContext,
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return context.db.Post
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .then(
                    (post: PostInstance) => {

                        throwError(!post, `Post with id ${ id } not found!`);
                        return post;
                    }
                )
                .catch(handleError);
        }
    },

    /**
     *  MUTATIONS
     */

     Mutation : {

        createPost: compose(...authResolvers)((
            parent,
            { input },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
        ) => {

            input.author = authUser.id;
            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.Post
                        .create(input, { transaction });
                }
            )
            .catch(handleError);
        }),

        updatePost: compose(...authResolvers)((
            parent, 
            { id, input },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
        ) => {
            input.author = authUser.
            id = parseInt(id);

            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.Post
                        .findById(id)
                        .then(
                            (post: PostInstance) => {

                                throwError(!post, `Post with id ${ id } not found!`); 
                                throwError(post.get('author') != authUser.id, `Unaunthorized! You can just update your own posts`); 

                                input.author = authUser.id;
                                return post.update(input, { transaction })
                            }
                        )
            })
            .catch(handleError);
        }),

        deletePost: compose(...authResolvers)((
            parent,
            { id, input },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.Post
                        .findById(id)
                        .then(
                            (post: PostInstance) => {

                                throwError(!post, `Post with id ${ id } not found!`);
                                throwError(post.get('author') != authUser.id, `Unaunthorized! You can just delete your own posts`); 

                                // should be .then(post => !!post)
                                return post
                                    .destroy({ transaction })
                                    .then(() => true)
                            }
                        )
            })
            .catch(handleError);
        })
     }

}