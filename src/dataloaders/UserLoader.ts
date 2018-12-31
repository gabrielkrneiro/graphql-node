import { UserModel, UserInstance } from "../models/UserModel";

export class UserLoader {
    
    /** 
     *  fetch registers in batch, instead fetch them one by one
    */
    static batchUsers(User: UserModel, ids: number[]): Promise<UserInstance[]> {

        return Promise.resolve(
            User.findAll({
                where: { id: { $in: ids } }
            })
        );
    }
}