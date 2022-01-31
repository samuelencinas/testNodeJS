/**
 * PRUEBA TÉCNICA PARA CONECTA TURISMO
 * Samuel Encinas Plaza
 * 
 * Archivo principal del microbackend
 */

/**
 * CARGA E INICIALIZACIÓN DE DEPENDENCIAS
 */

// Express y su configuración
const express = require('express')
const app = express()
const port = 8080
var bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

// FS para leer archivos del sistema y el JSON a leer
const fs = require('fs');
const authData = require('./validateAuth.json')

// Archivo de configuración de pino para los logs
const logger = require('./loggerService');

// Swagger
var swaggerUi = require('swagger-ui-express')
var jsyaml = require('js-yaml');
var spec = fs.readFileSync('swagger.yml', 'utf8');
var swaggerDocument = jsyaml.load(spec);

// Inicialización de fechas
var expirationDate = new Date();

/** VALIDACIÓN DE AUTENTICACIÓN
 * Valida el valor Authentication con el archivo validateAuth.json y la fecha de expiración con la actual.
 * Retorna un booleano que determina si es una autenticación válida.
 */
function validateAuthentication(token){
    const authItem = authData.find(elem => elem.id === token);
    if (!!authItem){
        const currentTime = new Date().getTime();
        expirationDate = new Date().setMilliseconds(authItem.expiration);
        return currentTime < expirationDate; // Devolverá true si la fecha de ahora
    } else return false;
}


/**
 * VALIDACIÓN DE DATOS RECIBIDOS
 * Valida los datos recibidos con la estructura dada. 
 * Retorna un booleano que determina si los datos son válidos
 */
function validateData(data){
    // Condición de obligatoriedad (todos los datos salvo description son obligatorios)
    if ((!!data.code || data.code === 0) && !!data.name && !!data.date){
        // Condiciones de tipado
        const codeValidation = typeof data.code === 'number' && Number.isInteger(data.code);
        const stringsValidation = typeof data.name === 'string' && typeof data.date === 'string';
        return codeValidation && stringsValidation; // Devolverá true si y solo si las dos condiciones de tipado se cumplen además de la de obligatoriedad
    } else return false;
}



/**
 * FUNCIÓN PRINCIPAL (request "/")
 * Se ha implementado la función lógica principal en la ruta raíz ("/"). 
 * Comprueba las validaciones y emite los logs y respuestas según corresponda.
 */
app.post('/', jsonParser, (req, res) => {
    // Carga del token pasado como Bearer authorization
    const bearerAuth = req.headers.authorization.split(" ");
    const token = bearerAuth[1];
    // Validación del token
    if (!!validateAuthentication(token)){
        logger.info("Validación del token de autenticación correcta. Usuario autenticado.");
        if (!!validateData(req.body)){
            logger.info("Validación de los datos recibidos correcta.");
            const receivedTime = new Date(req.body.date).getTime()
            const timeDifference = Math.abs(expirationDate - receivedTime);
            res.status(200).send(String(timeDifference));
        } else {
            logger.info("Validación de los datos recibidos incorrecta. Los datos no cuentan con el formato adecuado")
            res.status(400).send("Bad request. Have you set the correct data in the correct format?");
        }
    } else{
        logger.info("Validación del token de autenticación incorrecta. El usuario no se ha autenticado.")
        res.status(401).send("Unauthorized token value. Have you set it alright?");
    }
})

// Puesta en marcha de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ejecución del servidor
app.listen(port, () => {
console.log('Servidor ejecutándose!')
})