//for asincrono para esperar que el proceso se ejecute para ejecutar otro
//SE USARÁ PARA ALAMACENAR LA 3 IMÁGENES DEL PRODUCTO

module.exports = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}