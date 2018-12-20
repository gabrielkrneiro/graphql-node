"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const app_1 = require("./app");
const models_1 = require("./models");
const utils_1 = require("./utils");
const server = http.createServer(app_1.default);
const port = utils_1.normalizePort(process.env.port || 3000);
models_1.default.sequelize.sync() // sync sequelize with database
    .then(() => {
    server.listen(port);
    server.on('error', utils_1.onError);
    server.on('listening', utils_1.onListening(server));
});
