import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DBConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { userMutations } from "./user.schema";

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
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            return db.Post
                .findAll({
                    where: { author: parent.get('id') }, // pega todos os posts do author requisitado
                    limit: first,
                    offset: offset
                })
        }
    },

    /**
     *      QUERY
     *     users(first: Int, offset: Int): [User!]!
     *     user(id: ID!): User
     */
    Query: {
        users: (
            parent, 
            { first = 10, offset = 0 }, // pegando o first e offset do parametro da requisicao (args)
            { db } : {db: DbConnection}, // tipando o atribute db do context com um objeto de mesmo nome com o tipo DbConnection
            info: GraphQLResolveInfo
        ) => {

            return db.User
                .findAll({ 
                    limit: first,
                    offset: offset
                 })
        },
 
        user: async (
            parent, 
            { id }, 
            { db } : { db: DbConnection },
            info: GraphQLResolveInfo
        ) => {

            const user = await db.User.findById(id);

            if (!user) throw new Error(`User with id ${ id } not found`);

            return user;

            // return db.User
            //     .findById(id)
            //     .then((user: UserInstance) => {

            //         if (!user) throw new Error(`User with id ${ id } not found`);

            //         return user;
            //     })
            
        }
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
          createdUser: (
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
          },

          /**
           *  UPDATE
           * Comments: Using async await instead default way as above
           */
          updateUser: (
            parent,
            { id, input },
            { db }: { db: DbConnection },
            info: GraphQLResolveInfo
          ) => {

            id = parseInt(id);

            return db.sequelize.transaction(
                async (transaction: Transaction) => {

                    const user: UserInstance = await db.User.findById(id);

                    if(!user) throw new Error(`user with id ${ id } not found`);

                    return user.update(input, { transaction })
                }
            )
          },

          /**
           *  UPDATE PASSWORD
           */

           updateUserPassword: (
               parent,
               { id, input },
               { db }: { db: DbConnection },
               info: GraphQLResolveInfo
           ) => {

                return db.sequelize.transaction(
                    async (transaction: Transaction) => {

                        const user: UserInstance = await db.User.findById(id);

                        if(!user) throw new Error(`user with id ${ id } not found`);

                        return user
                            .update(input, { transaction })
                            .then((user: UserInstance) => !!user);
                    }
                ) 
           },

           /**
            *   DELETE
            */
           deleteUser: (
               parent,
               { id },
               { db }: { db: DbConnection },
               info: GraphQLResolveInfo
           ) => {

                return db.sequelize.transaction(
                    async (transaction: Transaction) => {

                        const user: UserInstance = await db.User.findById(id);

                        if (!user) throw new Error(`user with id ${ id } not found`);

                        return user.destroy({ transaction }).then(user => user);

                        // const user = db.User
                        //     .findById(id)
                        //     .then(
                        //         (user: UserInstance) => {

                        //             if (!user) throw new Error(`user with id ${ id } not found`);

                        //             return user.destroy({ transaction }).then(user => !!user);
                        //         }
                        //     );
                    }
                )
           },


     }

}