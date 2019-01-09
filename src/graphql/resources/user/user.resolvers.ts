import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DBConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { userMutations } from "./user.schema";
import { handleError, throwError } from "../../../utils";
import { compose } from "../../composable/composable.resolver";
import { authResolver, authResolvers } from "../../composable/auth.resolver";
import { verifyTokenResolver } from "../../composable/verify-token.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { RequestedFields } from "../../ast/RequestedFields";

/**
 * 
 *  todo resolver possui quatro parametros default (parent, args, context, info)
 */
export const userResolvers = {

    /**
     *  Resolver da associacao
     *     type User {
            ....
            posts(first: Int, offset: Int): [ Post! ]!
    }
     */
    User: {

        posts: (
            parent: UserInstance,
            {first = 10, offset = 0},
            { db, requestedFields }: { db: DbConnection, requestedFields: RequestedFields },
            info: GraphQLResolveInfo
        ) => {

            return db.Post
                .findAll({
                    where: { author: parent.get('id') }, // pega todos os posts do author requisitado
                    limit: first,
                    offset: offset,
                    attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .catch(handleError);
        }
    },

    /**
     *      QUERY
     *     users(first: Int, offset: Int): [User!]!
     *     user(id: ID!): User
     */
    Query: {

        /**
         *  just adding compose(), we are executing authResolver and if everything is ok,
         *  keep the flow, passing the request to the next function. I mean, protecting users with authResolver
         */
        users: (
            parent, 
            { first = 10, offset = 0 }, // pegando o first e offset do parametro da requisicao (args)
            { db, requestedFields }: { db: DbConnection, requestedFields: RequestedFields }, // tipando o atribute db do context com um objeto de mesmo nome com o tipo DbConnection
            info: GraphQLResolveInfo
        ) => {

            return db.User
                .findAll({ 
                    limit: first,
                    offset: offset,
                    attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                 })
                 .catch(handleError);
        },
 
        user: async (
            parent, 
            { id }, 
            { db, requestedFields }: { db: DbConnection, requestedFields: RequestedFields },
            info: GraphQLResolveInfo
        ) => {

            id = parseInt(id);

            return db.User
                .findById(id, {
                    attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .then((user: UserInstance) => {

                    // console.log();
                    throwError(!user, `User with id ${ id } not found`);

                    return user;
                })
                .catch(handleError);
            
        },

        currentUser: compose(...authResolvers)(
            (
                parent,
                args,
                { db, authUser, requestedFields }: { db: DbConnection, authUser: AuthUser, requestedFields: RequestedFields },
                info
            ) => {

                return db.User
                    .findById(authUser.id, {
                        attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                    })
                    .then((user: UserInstance) => {
                            
                        throwError(!user, `User with id ${ authUser.id } not found`);
                        return user;
                    })
                    .catch(handleError);
            }
        )
    },

    /**
     *  MUTATIONS
     *  createUser(input: UserCreateInput!): User
        updateUser(id: ID!, input: UserUpdateInput!): User
        updateUserPassword(id: ID!, input: UserUpdatePasswordInput!): Boolean
        deleteUser(id: ID!): Boolean

     *  Comments: Every mutation resolve handle transactions
     */

     Mutation : {
          /**
           *  CREATE
           */
          createUser: (
              parent,
              { input },
              { db }: { db: DbConnection },
              info: GraphQLResolveInfo
          ) => {

            return db.sequelize.transaction(
                (transaction: Transaction) => {

                    return db.User
                        .create(input, { transaction });
                }
            )
            .catch(handleError);
          },

          /**
           *  UPDATE
           *  Comments: Using async await instead default way as above
           *  firstly, check if there`s a user authenticated and if the token
           *  passed throug request headers is valid
           */
          updateUser: compose(...authResolvers)((
            parent,
            { input },
            { db, authUser }: { db: DbConnection, authUser: AuthUser },
            info: GraphQLResolveInfo
          ) => {

            return db.sequelize.transaction(
                async (transaction: Transaction) => {

                    const user: UserInstance = await db.User.findById(authUser.id);

                    throwError(!user, `user with id ${ authUser.id } not found`);

                    return user.update(input, { transaction })
                }
            )
            .catch(handleError);
          }),

          /**
           *  UPDATE PASSWORD
           */
           updateUserPassword: compose(...authResolvers)((
               parent,
               { input },
               { db, authUser }: { db: DbConnection, authUser: AuthUser },
               info: GraphQLResolveInfo
           ) => {

                return db.sequelize.transaction(
                    async (transaction: Transaction) => {

                        const user: UserInstance = await db.User.findById(authUser.id);

                        throwError(!user, `user with id ${ authUser.id } not found`);

                        return user
                            .update(input, { transaction })
                            .then((user: UserInstance) => !!user);
                    }
                ) 
                .catch(handleError);
           }),

           /**
            *   DELETE
            */
           deleteUser: compose(...authResolvers)((
               parent,
               args,
               { db, authUser }: { db: DbConnection, authUser: AuthUser },
               info: GraphQLResolveInfo
           ) => {

                return db.sequelize.transaction(
                    (transaction: Transaction) => {

                        return db.User
                            .findById(authUser.id)
                            .then(
                                (user: UserInstance) => {

                                    throwError(!user, `user with id ${ authUser.id } not found`);

                                    return user
                                        .destroy({ transaction })
                                        .then(() => true);
                                }
                            );
                    }
                )
                .catch(handleError);
           }),


     }

}