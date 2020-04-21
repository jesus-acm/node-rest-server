require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));


//Configuracion global de rutas
app.use(require('./routes/index'));



mongoose.connection.openUri(process.env.URLDB,{
    useNewUrlParser: true,
    useCreateIndex : true,//Quita el warning: DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
    useUnifiedTopology: true,
    useFindAndModify: false //Quita el otro warning de la funcion findAndUpdate
  },(err, res) => {
    if( err ) throw err;

    console.log('Base de datos ONLINE');
});


app.listen(process.env.PORT, () => {
    console.log(`Escuchando en el puerto ${ process.env.PORT }`);
});