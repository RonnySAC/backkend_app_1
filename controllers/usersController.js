const User = require('../models/user');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const Rol = require('../models/rol');
const storage = require('../utils/cloud_storage');

module.exports = {

    //OBTENEMOS TODOS LOS DATOS QUE NOS RETORNE LA CONSULTA
    async getAll(req, res, next) {
        try {
            const data = await User.getAll();
            console.log(`Usuarios: ${data}`);
            return res.status(201).json(data);
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los usuarios'
            });
        }
    },

    //obtener la información del usuario actualizado
    async findById(req, res, next) {
        try {
            const id = req.params.id;

            const data = await User.findByUserId(id);
            console.log(`Usuario: ${data}`);
            return res.status(201).json(data);
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener el usuario por ID'
            });
        }
    },
   
    async findDeliveryMen(req, res, next) {
        try {
            const data = await User.findDeliveryMen();
            console.log(`Repartidores: ${data}`);
            return res.status(201).json(data);
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los repartidores,'
            });
        }
    },

    async register(req, res, next) {
        try {
            const user = req.body;
            const data = await User.create(user);

            //establecemos el rol cliente por defecto
            await Rol.create(data.id, 1);

            return res.status(201).json({
                success: true,
                message: 'El registro se realizó correctamente, ahora ya puedes iniciar sesion',
                data: data.id
            });
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con el registro del usuario',
                error: error
            });
        }
    },

    async registerWithImage(req, res, next) {
        try {

            const user = JSON.parse(req.body.user);
            console.log(`Datos enviados del usuario: ${user}`);

            const files = req.files;

            if (files.length > 0) {
                const pathImage = `image_${Date.now()}`; // NOMBRE DEL ARCHIVO
                const url = await storage(files[0], pathImage);

                if (url != undefined && url != null) {
                    user.image = url;
                }
            }

            const data = await User.create(user);

            await Rol.create(data.id, 1); // ROL POR DEFECTO (CLIENTE)

            return res.status(201).json({
                success: true,
                message: 'El registro se realizó correctamente, ahora puede iniciar sesión',
                data: data.id
            });

        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con el registro del usuario',
                error: error
            });
        }
    },

    async update(req, res, next) {
        try {

            const user = JSON.parse(req.body.user);
            console.log(`Datos enviados del usuario: ${JSON.stringify(user)}`);

            const files = req.files;

            if (files.length > 0) {
                const pathImage = `image_${Date.now()}`; // NOMBRE DEL ARCHIVO
                const url = await storage(files[0], pathImage);

                if (url != undefined && url != null) {
                    user.image = url;
                }
            }

            await User.update(user);

            return res.status(201).json({
                success: true,
                message: 'Los datos del usuario se actualizaron correctamente',
            });

        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error al actualizar los datos del usuario',
                error: error
            });
        }
    },

    async updateNotificationToken(req, res, next) {
        try {

            const body = req.body;
            console.log('Datos enviados del usuario: ', body);

            await User.updateNotificationToken(body.id, body.notification_token);

            return res.status(201).json({
                success: true,
                message: 'El token de notificaciones se ha almacenado correctamente'
            });

        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con la actualizacion de datos del usuario',
                error: error
            });
        }
    },

    async login(req, res, next) {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const myuser = await User.findByEmail(email);

            if (!myuser) {
                return res.status(401).json({
                    success: false,
                    message: 'Lo sentimos, el e-mail ingresado no fue encontrado.'
                });
            }

            //comparamos el password que envia el usuario al iniciar seisón es igual al que tenemos en la bd
            if(User.isPasswordMatched(password, myuser.password)) {
                const token = jwt.sign({id: myuser.id, email: myuser.email}, keys.secretOrKey, {
                    expiresIn: (60*60*24) //1 hora , la sesión expira en 1 hora
                    //expiresIn: (60*1) //1 minuto , la sesión expira en 1 minuto - pruebas
                });
                const data = {
                    id: myuser.id,
                    name: myuser.name,
                    lastname: myuser.lastname,
                    email: myuser.email,
                    phone: myuser.phone,
                    image: myuser.image,
                    session_token: `JWT ${token}`,
                    roles: myuser.roles
                }

                await User.updateToken(myuser.id, `JWT ${token}`);

                console.log(`USUARIO ENVIADO ${data}`);
                
                return res.status(201).json({
                    success: true,
                    message: '¡Bienvenido, gracias por su preferencia!',
                    data: data
                });
            }
            else {
                return res.status(401).json({
                    success: false,
                    message: 'La contraseña ingresada es incorrecta.'
                });
            }
        }
        catch (error) {
            console.log('Error: ${error}');
            return res.status(501).json({
                success: false,
                message: 'Error al momento de loguearse, vuelva a intentarlo.',
                error: error
            });
        }
    },

    async logout(req, res, next) {
        try {
            const id = req.body.id;
            await User.updateToken(id, null);
            return res.status(201).json({
                success: true,
                message: '¡Su sesión se ha cerrado correctamente!',
            });
        }
        catch (error){
            console.log('Error: ${error}');
            return res.status(501).json({
                success: false,
                message: 'Error al momento de cerrar sesión',
                error: error
            });
        }

    }

};