//RUTAS PARA EJECUTAR LOS MÉTODOS

const UsersController = require('../controllers/usersController');
const passport = require('passport');

module.exports = (app, upload) => {
    //ruta para obtener todos los usuarios
    app.get('/api/users/getAll', UsersController.getAll);

    //ruta para obtener los datos del usuario actualizados
    app.get('/api/users/findById/:id', passport.authenticate('jwt', {session: false}), UsersController.findById);

    //ruta para listar los repartidores
    app.get('/api/users/findDeliveryMen', passport.authenticate('jwt', { session: false }), UsersController.findDeliveryMen);

    //insercción del usuario
    app.post('/api/users/create', upload.array('image', 1), UsersController.registerWithImage);

    //logueo
    app.post('/api/users/login', UsersController.login);
    //cerrar sesión
    app.post('/api/users/logout', UsersController.logout);

    //actualizar datos
    app.put('/api/users/update', passport.authenticate('jwt', { session: false }), upload.array('image', 1), UsersController.update);
    app.put('/api/users/updateNotificationToken', UsersController.updateNotificationToken)
}