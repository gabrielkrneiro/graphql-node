import http = require('http');

import app from './app';
import { onError, normalizePort, onListening } from './utils';

const server = http.createServer(app);
const port = normalizePort(process.env.port || 3000);

server.listen(port);
server.on('error', onError); 
server.on('listening', onListening(server));