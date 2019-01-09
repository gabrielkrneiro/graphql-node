import * as graphqlHTTP from 'express-graphql';

import express = require('express');
import { Application } from "express";

import db from './models';
import { DataLoaderFactory } from './dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import schema from './graphql/schema';


class App {

    public express: Application;
    private dataLoaderFactory: DataLoaderFactory;
    private requestedFields: RequestedFields;

    constructor() {

        this.express = express();
        this.init();
    }

    private init(): void {

        this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
        this.requestedFields = new RequestedFields();
        this.middleware();
    }

    private middleware(): void {

        // coloca a instancia do banco de dados de forma global na aplicacao
        // exportando a instancia no parametro context da aplicacao
        
        // todo middleware precisa retornar um RequestHandler
        this.express.use('/graphql', 
            extractJwtMiddleware(),
            (req, res, next) => { 
                req['context']['db'] = db;
                req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders(); // guarda os dataloaders no contexto
                req['context']['requestedFields'] = this.requestedFields;
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