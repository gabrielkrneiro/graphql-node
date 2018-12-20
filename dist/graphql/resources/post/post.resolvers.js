"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
exports.postResolvers = {
    /**
     *  QUERY NAO TRIVIAIS
     */
    Post: {
        author: (parent, args, { db }, { db: DbConnection }, info) => {
            // parent == current post instance
            // aqui o author == number == author.id
            return db.User
                .findById(parent.get('author'))
                .catch(utils_1.handleError);
        },
        comments: (parent, args, { db }, { db: DbConnection }, info) => {
            return db.Comment
                .findAll({
                where: { post: parent.get('id') }
            })
                .catch(utils_1.handleError);
        },
    },
    /**
     *  QUERY
     */
    Query: {
        posts: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({ limit: first, offset })
                .catch(utils_1.handleError);
        },
        post: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.Post
                .findById(id)
                .then((post) => {
                if (!post)
                    throw new Error(`Post with id ${id} not found!`);
                return post;
            })
                .catch(utils_1.handleError);
        }
    },
    /**
     *  MUTATIONS
     */
    Mutation: {
        createPost: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .create(input, { transaction });
            })
                .catch(utils_1.handleError);
        },
        updatePost: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found!`);
                    return post.update(input, { transaction });
                });
            })
                .catch(utils_1.handleError);
        },
        deletePost: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found!`);
                    // should be .then(post => !!post)
                    return post
                        .destroy({ transaction })
                        .then(() => true);
                });
            })
                .catch(utils_1.handleError);
        }
    }
};
