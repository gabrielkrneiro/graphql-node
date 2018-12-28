import * as jwt from 'jsonwebtoken';
import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import { GraphQLFieldResolver } from "graphql";
import { JWT_SECRET } from '../../utils';


/**
 *  check if authorization token passed in header request is valid or not.
 */
export const verifyTokenResolver: ComposableResolver<any, ResolverContext> = 
    (resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {

        return (parent, args, context: ResolverContext, info) => {

            const token: string = context.authorization ? context.authorization.split(' ')[1]: undefined;

            return jwt.verify(token, JWT_SECRET, (error, decoded: any) => { // the verify itself

                if (!error) return resolver(parent, args, context, info);

                throw new Error(`${error.name}: ${error.message}`);
            });
        }
    }