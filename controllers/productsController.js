const Product = require('../models/product');
const storage = require('../utils/cloud_storage');
const asyncForEach = require('../utils/async_foreach');

module.exports = {

    async findByCategory(req, res, next) {
        try {
            const id_category = req.params.id_category; 
            const data = await Product.findByCategory(id_category);

            return res.status(201).json(data);

        } 
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                message: `Error al  listar los productos por categoría`,
                success: false,
                error: error
            });
        }
    },

    async findByCategoryAndProductName(req, res, next) {
        try {
            const id_category = req.params.id_category; 
            const product_name = req.params.product_name;
            const data = await Product.findByCategoryAndProductName(id_category, product_name);
            return res.status(201).json(data);
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                message: `Error al listar los productos por categoria.`,
                success: false,
                error: error
            });
        }
    },


    async create(req, res, next) {

        let product = JSON.parse(req.body.product);
        console.log(`Producto ${JSON.stringify(product)}`);

        //constante que contendrá las 3 imágenes
        const files = req.files;

        let inserts = 0; //variable que se inicializa en 0 porque al principio tendremos 0 imágenes almacenadas

        if(files.length === 0) {
            return res.status(501).json({
                message: 'Error al registrar el producto, le falta agregar las imágenes',
                success: false
            });
        } 
        else {
            try {

                //almacenamos los datos del producto
                const data = await Product.create(product);
                product.id = data.id;

                const start = async () => {
                    await asyncForEach(files, async (file) => {
                        //creamos el nombre de la imagen
                        const pathImage = `image_${Date.now()}`;
                        const url = await storage(file, pathImage);

                        if (url != undefined && url !== null) {
                            if(inserts == 0) { //IMAGEN 1 -> alamacena la imagen 1
                                product.image1 = url;
                            }
                            else if (inserts == 1) { //IMAGEN 2 -> alamacena la imagen 2
                                product.image2 = url;
                            }
                            else if (inserts == 2) { //IMAGEN 3 -> alamacena la imagen 3
                                product.image3 = url;
                            }
                        }

                        await Product.update(product); 
                        //conteo de la cantidad de archivos que se han alamacenado hasta el momento
                        inserts = inserts +1;

                        //preguntamos si las 3 imagenes ya se terminaorn de almacenar
                        if (inserts == files.length) {
                            return res.status(201).json({
                                success: true,
                                message: 'El producto se ha registrado correctamente'
                            });
                        }

                    });
                }

                //inicializa y guarda el registro de las imagenes en la bd
                start();

            } catch (error) {
                console.log(`Error: ${error}`);
                return res.status(501).json({
                    message: `Error al registrar el producto ${error}`,
                    success: false,
                    error: error
                });
            }
        }
    },
}
