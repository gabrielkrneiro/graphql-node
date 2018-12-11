import http = require('http');

import app from './app';

import db from './models';

import { onError, normalizePort, onListening } from './utils';

const server = http.createServer(app);
const port = normalizePort(process.env.port || 3000);

db.sequelize.sync()
    .then(() => {
        
        server.listen(port);
        server.on('error', onError); 
        server.on('listening', onListening(server));
    });
    