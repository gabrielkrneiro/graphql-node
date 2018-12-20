import { DbConnection } from "../../../interfaces/DBConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../../utils";
import { compareSync } from "bcryptjs";

export const tokenResolvers = {

    Mutation: {

        createToken: async (
            parent,
            { email, password },
            { db }: { db: DbConnection }
        ) => {

            const user: UserInstance = await db.User.findOne({ 
                where: { email },
                attributes: ['id', 'password']
            });

            /* 
            *   verificando se o usuario existe e 
            *   compara a senha do usuario como eh no banco com a 
            *   que foi repassada pela aplicacao
            */
            if (!user || !compareSync(password, user.get('password'))) 
                throw new Error(`Unauthorized, wrong email or password`);
            

            // dado do usuario usado na criptografia
            const payload = { sub: user.get('id') }

            return {
                token: jwt.sign(payload, JWT_SECRET)
            }
        }
    }
}