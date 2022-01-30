/**
 * PRUEBA TÉCNICA PARA CONECTA TURISMO
 * Samuel Encinas Plaza
 * 
 * Archivo principal del microbackend
 */

// Carga e inicialización de dependencias
const express = require('express')
const fs = require('fs');
const authData = require('./validateAuth.json')
const app = express()
const port = 8080
var bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const logger = require('./loggerService');


const today = new Date();
var expirationDate = new Date();

/** VALIDACIÓN DE AUTENTICACIÓN
 * Valida el valor Authentication con el archivo validateAuth.json y la fecha de expiración con la actual.
 * Retorna un booleano que determina si es una autenticación válida.
 */
function validateAuthentication(token){
    const authItem = authData.find(elem => elem.id === token);
    if (!!authItem){
        expirationDate = new Date().setMilliseconds(authItem.expiration);
        return today < expirationDate;
    } else return false;
}


/**
 * VALIDACIÓN DE DATOS RECIBIDOS
 * Valida los datos recibidos con la estructura dada. 
 * Retorna un booleano que determina si los datos son válidos
 */
function validateData(data){
    // Condición de obligatoriedad (todos los datos salvo description son obligatorios)
    if (!!data.code && !!data.name && !!data.date){
        // Condiciones de tipado
        const codeValidation = typeof data.code === 'number' && Number.isInteger(data.code);
        const stringsValidation = typeof data.name === 'string' && typeof data.date === 'string';
        return codeValidation && stringsValidation;
    } else return false;
}



// Función principal
app.get('/', jsonParser, (req, res) => {
    const bearerAuth = req.headers.authorization.split(" ");
    const token = bearerAuth[1];
    if (!!validateAuthentication(token)){
        if (!!validateData(req.body)){
            const timeDifference = expirationDate - today;
            res.status(200).send(String(timeDifference));
        } else {
            res.status(400).send("Bad request. Have you set the correct data in the correct format?");
        }
    } else{
        res.status(401).send("Unauthorized token value. Have you set it alright?");
    }
})

// Ejecución del servidor
app.listen(port, () => {
console.log('Servidor ejecutándose en el puerto ${port}')
})