"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
// getting current file reference
const basename = path.basename(module.filename);
// getting current environment reference
const env = process.env.NODE_ENV || 'development';
// getting config.json configuration according to env value
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];
let db = null;
if (!db) {
    db = {};
    // motivo: please use symbol based operators for better security...
    // solucao: desativar a necessidade de usar tais operadores
    const operatorAliases = false;
    config = Object.assign({ operatorAliases }, config);
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    fs
        .readdirSync(__dirname) // retorna um array com o nome de todos os arquivos no diretorio passado como parametro
        .filter((file) => {
        /* retorna somente o arquivos que
        *   - o primeiro caractere do nome do arquivo nao pode ser .
        *   - o arquivo nao pode ser igual ao nome do arquivo atual (basename)
        *   - a extensao do arquivo precisa ser igual a .js
        */
        return (file.indexOf('.') !== 0 && (file !== basename) && (file.slice(-3) === '.js'));
    })
        .forEach((file) => {
        const model = sequelize.import(path.join(__dirname, file)); // importacao do model do Sequelize
        // coloca cada model dentro do db
        db[model['name']] = model;
    });
    // carrega as associacoes
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    db['sequelize'] = sequelize;
}
exports.default = db;
