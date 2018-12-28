import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import { GraphQLFieldResolver } from "graphql";
import { verifyTokenResolver } from "./verify-token.resolver";

/**
 *  Comments: {{ This is a reusable resolver }}. If in context there`s any user or authorization token, pass the request
 *  ahead. If don`t, throw an error. But this resolver does not check if the authorization in context, if it exists, is valid.
 */
export const authResolver: ComposableResolver<any, ResolverContext> = 
    (resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {

        return ( parent, args, context, info ) => {

            if (context.authUser || context.authorization) {

                return resolver(parent, args, context, info);
            }

            throw new Error('Unaunthorized! Token not provided');
        }
    };

export const authResolvers = [authResolver, verifyTokenResolver];

