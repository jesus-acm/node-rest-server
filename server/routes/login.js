const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                error: err
              });
        }
        
        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                error: {
                    message: '(Usuario) o contraseña incorrectos.'
                }
              });
        }else{
            if(!bcrypt.compareSync(body.password, usuarioDB.password)){
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Usuario o (contraseña) incorrectos.'
                    }
                  });
            }
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN}); //Expira en 30 dias
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });
});



// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
  

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser =  await verify(token)
                            .catch(e => {
                                return res.status(403).json({
                                    ok: false,
                                    err: e
                                });
                            });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        
        if(err){
            return res.status(500).json({
                ok: false,
                error: err
              });
        }

        if (usuarioDB){//Existe el usuario
            if(!usuarioDB.google){//Se autentico normal (Sin la key de Google Sign In)
                return res.status(400).json({
                    ok: false,
                    err: {
                        mensaje: 'Debe de usar su autenticación normal.'
                    }
                  });
            }else{//Se autentico con google
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN}); //Expira en 30 dias
                
                
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        }else{//El usuario no existe en nuestra DB y se esta registrando por primera vez
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if(err){
                    res.status(500).json({
                        ok: false,
                        err
                      });
                }
                

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN}); //Expira en 30 dias
                
                
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    })
});


module.exports = app;