import { DbConnection } from "./DBConnectionInterface";
import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

/**
 *  tell what attributes application context may has
 */
export interface ResolverContext {

    db?: DbConnection;
    authorization?: string;
    authUser?: AuthUser;
    dataLoaders?: DataLoaders;
    requestedFields: RequestedFields;
}