const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');

const app = express();


app.get('/usuario', verificaToken, (req, res) => {

    let desde = Number (req.query.desde) || 0;

    
    let limite = Number (req.query.limite) || 5;
    Usuario.find({estado: true}, 'nombre email role estado google img')
      .skip(desde)
      .limit(limite)
      .exec((err, usuariosDB) => {
      if(err){
        return res.status(400).json({
          ok: false,
          error: err
        });
      }

      Usuario.countDocuments({estado: true}, (err, cont) => {

        res.json({
          ok: true,
          usuarios: usuariosDB,
          total: cont
        });

      })
    });
  });
  
app.post('/usuario',[verificaToken, verificaAdminRole], (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync (body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

      if(err){
          return res.status(400).json({
              ok: false,
              error: err
          });
      }

      //usuarioDB.password = null;
      res.json({
          ok:true,
          usuario: usuarioDB
      });
    });
});
    
app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

  let id = req.params.id;
  let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

  delete body.password;
  delete body.google;

  Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'}, (err, usuarioDB) => {

    if(err){
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});
    
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  let body = {estado: false};

  Usuario.findByIdAndUpdate(id, body, {new: true}, (err, usuarioBorrado) => {

    if(err){
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});
    
module.exports = app;