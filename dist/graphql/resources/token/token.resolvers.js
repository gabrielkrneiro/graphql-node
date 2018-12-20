"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const utils_1 = require("../../../utils");
const bcryptjs_1 = require("bcryptjs");
exports.tokenResolvers = {
    Mutation: {
        createToken: (parent, { email, password }, { db }) => __awaiter(this, void 0, void 0, function* () {
            const user = yield db.User.findOne({
                where: { email },
                attributes: ['id', 'password']
            });
            /*
            *   verificando se o usuario existe e
            *   compara a senha do usuario como eh no banco com a
            *   que foi repassada pela aplicacao
            */
            if (!user || !bcryptjs_1.compareSync(password, user.get('password')))
                throw new Error(`Unauthorized, wrong email or password`);
            // dado do usuario usado na criptografia
            const payload = { sub: user.get('id') };
            return {
                token: jwt.sign(payload, utils_1.JWT_SECRET)
            };
        })
    }
};
