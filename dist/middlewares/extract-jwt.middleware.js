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
const models_1 = require("./../models");
const utils_1 = require("../utils");
exports.extractJwtMiddleware = () => {
    return (req, res, next) => {
        const authorization = req.get('Authorization'); // Bearer asdfasdfasdf
        const token = authorization ? authorization.split(' ')[1] : undefined;
        // cria esses dois atributos na requisicao para serem passados a diante
        req['context'] = {};
        req['context']['authorization'] = authorization;
        // se nao existe token, para aqui e repassa a requisicao sem token
        if (!token)
            return next();
        // jwt.verify() verifica se eh valido e retorna no callback infos codificadas no token
        jwt.verify(token, utils_1.JWT_SECRET, (error, decoded) => __awaiter(this, void 0, void 0, function* () {
            // se deu algum erro, para aqui e repassa a requisicao sem token
            if (error)
                return next();
            const user = yield models_1.default.User.findById(decoded.sub, {
                attributes: ['id', 'email']
            });
            if (user) {
                req['context']['user'] = {
                    id: user.get('id'),
                    email: user.get('email')
                };
            }
            return next();
        }));
    };
};
