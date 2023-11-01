//definimos las variables
const promise = require('bluebird');
const options = {
    promiseLib: promise,
    query: (e) => {

    }
}

const pgp = require('pg-promise')(options);
const types = pgp.pg.types;
types.setTypeParser(1114, function(stringValue) {
    return stringValue;
});

//ESTABLECEMOS LOS VALORES PARA CONECTARNOS A LA BD

const databaseConfig = {
    'host': '127.0.0.1',
    'port': 5432,
    'database': 'f_ronny_db',
    'user': 'postgres',
    'password': '04200130Alex#'
};

const db = pgp(databaseConfig);

//para utilizar la variable en los diferentes archivos que vayamos creando
module.exports = db;