import { DbConnection } from "./DBConnectionInterface";
import { AuthUser } from "./AuthUserInterface";

export interface ResolverContext {

    db?: DbConnection;
    authorization?: string;
    authUser?: AuthUser;
}