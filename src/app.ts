import express = require('express');
import { Application } from "express";
import * as graphqlHTTP from 'express-graphql';

import db from './models'
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';

class App {

    public express: Application;

    constructor() {

        this.express = express();
        this.middleware();
    }

    private middleware(): void {

        // coloca a instancia do banco de dados de forma global na aplicacao
        // exportando a instancia no parametro context da aplicacao
        
        // todo middleware precisa retornar um RequestHandler
        this.express.use('/graphql', 
            extractJwtMiddleware(),
            (req, res, next) => { 
                req['context'].db = db;
                next();
            }, 
            graphqlHTTP(req => ({
                schema,
                graphiql: process.env.NODE_ENV === 'development',
                context: req['context'] // permite acessar a instancia db em todos os resolver que criarmos
            }))
        );
    }
}

export default new App().express;