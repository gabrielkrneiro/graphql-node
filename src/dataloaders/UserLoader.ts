import { UserModel, UserInstance } from "../models/UserModel";
import { DataLoaderParam } from "../interfaces/DataLoarderParamInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export class UserLoader {
    
    /** 
     *  fetch registers in batch, instead fetch them one by one
    */
    static batchUsers(
        User: UserModel, 
        params: DataLoaderParam<number>[], 
        requestedFields: RequestedFields): Promise<UserInstance[]> {

        let ids: number[] = params.map(param => param.key);

        return Promise.resolve(
            User.findAll({
                where: { id: { $in: ids },
                attribute: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['posts'] }) }
            })
        );
    }
}