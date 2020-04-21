
//======================================
// Puerto
//======================================

process.env.PORT = process.env.PORT || 3000;

//======================================
// Entorno
//======================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//======================================
// Vencimiento del Token
//======================================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


//======================================
// SEED de autenticacion
//======================================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


//======================================
// Bases de datos
//======================================
let urlDB;

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//=======================================
//Google Client Id
//=======================================

process.env.CLIENT_ID = process.env.CLIENT_ID || '396948350030-m5ekqe4j12f7fmjh23ne87jv8iuusntn.apps.googleusercontent.com';