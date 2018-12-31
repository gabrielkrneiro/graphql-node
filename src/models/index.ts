import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { DbConnection } from '../interfaces/DBConnectionInterface';

// getting current file reference
const basename: string = path.basename(module.filename);

// getting current environment reference
const env: string = process.env.NODE_ENV || 'development';

// getting config.json configuration according to env value
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];

let db = null;

if (!db) {

    db = {};

    //  motivo: please use symbol based operators for better security...
    //  solucao: se nao estiver usando nenhum operator, desativar a 
    //  necessidade de usar tais operadores
    const operatorAliases = { 
        $in: Sequelize.Op.in // Ex.: [2, 4, 7, 10] -> procura registros com esses IDs
     };
    config = Object.assign({ operatorAliases }, config)

    const sequelize: Sequelize.Sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );

    fs
        .readdirSync(__dirname) // retorna um array com o nome de todos os arquivos no diretorio passado como parametro
        .filter((file: string) => {

            /* retorna somente o arquivos que
            *   - o primeiro caractere do nome do arquivo nao pode ser .
            *   - o arquivo nao pode ser igual ao nome do arquivo atual (basename)
            *   - a extensao do arquivo precisa ser igual a .js
            */
            return (file.indexOf('.') !== 0 && (file !== basename) && (file.slice(-3) === '.js'))
        })
        .forEach((file: string) => {

            const model = sequelize.import(path.join(__dirname, file)); // importacao do model do Sequelize

            // coloca cada model dentro do db
            db[model['name']] = model 
        });

    // carrega as associacoes
    Object.keys(db).forEach((modelName: string) => {
        
        if (db[modelName].associate) {

            db[modelName].associate(db);
        }
    });

    db['sequelize'] = sequelize;
}

export default <DbConnection>db;