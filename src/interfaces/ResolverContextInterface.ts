import { DbConnection } from "./DBConnectionInterface";
import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";

/**
 *  tell what attributes application context may has
 */
export interface ResolverContext {

    db?: DbConnection;
    authorization?: string;
    authUser?: AuthUser;
    dataLoaders?: DataLoaders;
}