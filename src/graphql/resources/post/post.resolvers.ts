import { DbConnection } from '../../../interfaces/DBConnectionInterface';
import { GraphQLResolveInfo } from 'graphql';
import { PostInstance } from '../../../models/PostModel';
import { Transaction } from 'sequelize';

export const postResolvers = {

    /**
     *  QUERY NAO TRIVIAIS
     */
    Post: {

        author: (
            parent: PostInstance,
            args,
            { db }: { db: DbConnection },
            { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {
            // parent == current post instance
            // aqui o author == number == author.id
            return db.User.findById(parent.get('author')); 
        },

        comments: (
            parent: PostInstance,
            args,
            { db }: { db: DbConnection },
            { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.Comment.findAll({
                where: { post: parent.get('id') }
            })
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

            return db.Post.findAll({ limit: first, offset })
        },

        post: (
            parent,
            { id },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.Post
                .findById(id)
                .then(
                    (post: PostInstance) => {

                        if (!post) throw new Error(`Post with id ${ id } not found!`);
                        return post;
                    }
                )
        }
    },

    /**
     *  MUTATIONS
     */

     Mutation : {

        createPost: (
            parent,
            { input },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.Post
                        .create(input, { transaction });
                }
            )
        },

        updatePost: (
            parent,
            { id, input },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.Post
                        .findById(id)
                        .then(
                            (post: PostInstance) => {

                                if (!post) throw new Error(`Post with id ${ id } not found!`);

                                return post.update(input, { transaction })
                            }
                        )
                }
            )
        },

        deletePost: (
            parent,
            { id, input },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.Post
                        .findById(id)
                        .then(
                            (post: PostInstance) => {

                                if (!post) throw new Error(`Post with id ${ id } not found!`);


                                // should be .then(post => !!post)
                                return post.destroy({ transaction }).then(post => post)
                            }
                        )
                }
            )
        }
     }

}