import express = require('express');
import { Application } from "express";
import * as graphqlHTTP from 'express-graphql';

import db from './models'
import schema from './graphql/schema';

class App {

    public express: Application;

    constructor() {

        this.express = express();
        this.middleware();
    }

    private middleware(): void {

        this.express.use('/graphql', 
            (req, res, next) => { // coloca a instancia do banco de dados de forma global na aplicacao
                req['context'] = {};
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