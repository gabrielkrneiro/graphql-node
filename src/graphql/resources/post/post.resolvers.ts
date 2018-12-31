import { DbConnection } from '../../../interfaces/DBConnectionInterface';
import { GraphQLResolveInfo } from 'graphql';
import { PostInstance } from '../../../models/PostModel';
import { Transaction } from 'sequelize';
import { handleError, throwError } from '../../../utils';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { AuthUser } from '../../../interfaces/AuthUserInterface';
import { DataLoaders } from '../../../interfaces/DataLoadersInterface';

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
                .load(post.get('author'))
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
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.Comment
                .findAll({
                    where: { post: parent.get('id') }
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
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.Post
                .findAll({ limit: first, offset })
                .catch(handleError);
        },

        post: (
            parent,
            { id },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.Post
                .findById(id)
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