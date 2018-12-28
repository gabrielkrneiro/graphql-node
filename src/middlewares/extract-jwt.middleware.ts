import * as jwt from 'jsonwebtoken';
import db from './../models';
import { RequestHandler, Request, Response, NextFunction } from "express";
import { JWT_SECRET } from '../utils';

export const extractJwtMiddleware = (): RequestHandler => {

    return (req: Request, res: Response, next: NextFunction): void => {

        const authorization: string = req.get('Authorization'); // Bearer asdfasdfasdf
        const token: string = authorization ? authorization.split(' ')[1] : undefined;

        // cria esses dois atributos na requisicao para serem passados a diante
        req['context'] = {};
        req['context']['authorization'] = authorization;

        // se nao existe token, para aqui e repassa a requisicao sem token
        if (!token) return next();

        // jwt.verify() verifica se eh valido e retorna no callback infos codificadas no token
        jwt.verify(token, JWT_SECRET, async (error, decoded: any) => {
            
            // se deu algum erro, para aqui e repassa a requisicao sem token
            if (error) return next();

            const user = await db.User.findById(decoded.sub, {
                attributes: ['id', 'email']
            });

            if (user) {
                
                req['context']['authUser'] = {
                    id: user.get('id'),
                    email: user.get('email')
                };
            }

            return next();
        });
    }
}