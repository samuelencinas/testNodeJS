/**
 * PRUEBA TÉCNICA PARA CONECTA TURISMO
 * Samuel Encinas Plaza
 * 
 * Archivo de configuración de pino como servicio de logger
 */

const pino = require('pino')
const levels = {
  http: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};
module.exports = pino(
  {
    customLevels: levels,
    base: undefined,
    useOnlyCustomLevels: true,
    level: 'http',
    prettyPrint: {
      colorize: true,
      levelFirst: true,
      translateTime: 'dd-mm-yyyy, h:MM:ss TT',
    },
  },
  pino.destination(`${__dirname}/logger.log`)
)