"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
/**
 *
 *  todo resolver possui quatro parametros default (parent, args, context, info)
 */
exports.userResolvers = {
    /**
     *  Resolver da associacao
     *     type User {
            ....
            posts(first: Int, offset: Int): [ Post! ]!
    }
     */
    User: {
        posts: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({
                where: { author: parent.get('id') },
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        }
    },
    /**
     *      QUERY
     *     users(first: Int, offset: Int): [User!]!
     *     user(id: ID!): User
     */
    Query: {
        users: (parent, { first = 10, offset = 0 }, // pegando o first e offset do parametro da requisicao (args)
        { db }, // tipando o atribute db do context com um objeto de mesmo nome com o tipo DbConnection
        info) => {
            return db.User
                .findAll({
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        },
        user: (parent, { id }, { db }, info) => __awaiter(this, void 0, void 0, function* () {
            id = parseInt(id);
            return db.User
                .findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`User with id ${id} not found`);
                return user;
            })
                .catch(utils_1.handleError);
        })
    },
    /**
     *  MUTATIONS
     *  createUser(input: UserCreateInput!): User
        updateUser(id: ID!, input: UserUpdateInput!): User
        updateUserPassword(id: ID!, input: UserUpdatePasswordInput!): Boolean
        deleteUser(id: ID!): Boolean

     *  Comments: Every mutation resolve handle transactions
     */
    Mutation: {
        /**
         *  CREATE
         */
        createUser: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .create(input, { transaction });
            })
                .catch(utils_1.handleError);
        },
        /**
         *  UPDATE
         * Comments: Using async await instead default way as above
         */
        updateUser: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield db.User.findById(id);
                if (!user)
                    throw new Error(`user with id ${id} not found`);
                return user.update(input, { transaction });
            }))
                .catch(utils_1.handleError);
        },
        /**
         *  UPDATE PASSWORD
         */
        updateUserPassword: (parent, { id, input }, { db }, info) => {
            return db.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield db.User.findById(id);
                if (!user)
                    throw new Error(`user with id ${id} not found`);
                return user
                    .update(input, { transaction })
                    .then((user) => !!user);
            }))
                .catch(utils_1.handleError);
        },
        /**
         *   DELETE
         */
        deleteUser: (parent, { id }, { db }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`user with id ${id} not found`);
                    return user
                        .destroy({ transaction })
                        .then(() => true);
                });
            })
                .catch(utils_1.handleError);
        },
    }
};
