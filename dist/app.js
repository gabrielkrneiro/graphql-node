"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const graphqlHTTP = require("express-graphql");
const models_1 = require("./models");
const schema_1 = require("./graphql/schema");
class App {
    constructor() {
        this.express = express();
        this.middleware();
    }
    middleware() {
        // coloca a instancia do banco de dados de forma global na aplicacao
        // exportando a instancia no parametro context da aplicacao
        this.express.use('/graphql', (req, res, next) => {
            req['context'] = {};
            req['context'].db = models_1.default;
            next();
        }, graphqlHTTP(req => ({
            schema: schema_1.default,
            graphiql: process.env.NODE_ENV === 'development',
            context: req['context'] // permite acessar a instancia db em todos os resolver que criarmos
        })));
    }
}
exports.default = new App().express;
