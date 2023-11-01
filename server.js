//definimos las constantes
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const passport = require('passport');
const io = require('socket.io')(server);
const mercadopago = require('mercadopago');

/*
* MERCADO PAGO CONFIGUARCIÓN
*/
mercadopago.configure({
    access_token: 'TEST-1366316962470831-110111-7f9aab184310fc3bab3ef95a73dacbaa-1229522628'
});


/*
* SOCKETS
*/
const orderDeliverySocket = require('./sockets/orders_delivery_socket');

/*
* INICIALIZAR FIREBASE
*/
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const upload = multer({
    storage: multer.memoryStorage()
})

/* 
* RUTAS
*/
const users = require('./routes/usersRoutes');
const categories = require('./routes/categoriesRoutes');
const products = require('./routes/productsRoutes');
const address = require('./routes/addressRoutes');
const orders = require('./routes/ordersRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');


//define el puerto que escucha el servidor 
const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//configuración de seguridad
app.disable('x-powered-by');

app.set('port', port);

//llamamos al sockets
orderDeliverySocket(io);

//para ejecutar
//llamando a las rutas
users(app, upload);
categories(app);
address(app);
orders(app);
products(app, upload);
mercadoPagoRoutes(app);

//LE DECIMOS EN QUE PUERTO ESCUCHARÁ NUESTRO SERVIDOR ASÍ MISMO LE ASIGANAMOS NUESTRA IP PARA PROBAR EL BACKEND
//EN CASO HAYA UN ERROR CON NUESTRA IP , LE DECIMOS QUE APUNTE DIRECTAMENTE AL LOCALHOST
//TIENES QUE CAMBIAR ESO PONES TU DIRECCIÓN IP QUE T HAN ASIGNADO, EJEMPLO
server.listen(3000, '192.168.1.36' || 'localhost', function(){
    console.log('Aplicación de NodeJS ' + port + ' Iniciada...')
});

//CONFIGURACIÓN DE ERRORES
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});


module.exports = {
    app: app,
    server: server
}

/*MENSAJES
200 -> RESPUESTA EXITOSA
404 -> URL NO EXISTE
500 -> ERROR INTERNO DEL SERVIDOR
*/ 
