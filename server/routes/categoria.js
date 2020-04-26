const express = require('express');

const app = express();

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let Categoria = require('../models/categoria');

// MUESTRA TODAS LAS CATEGORIAS
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
            .sort('descripcion')
            .populate('usuario', 'nombre email')
            .exec((err, categoriasDB) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                
                res.json({
                    ok: true,
                    categorias: categoriasDB
                });
            });
});

// MUESTRA LA CATEGORIA DEL ID
app.get('/categoria/:id', verificaToken,  (req, res) => {

    let id = req.params.id;
    //Categoria.findById
    Categoria.findById(id, (err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// CREAR UNA NUEVA CATEGORIA
app.post('/categoria', verificaToken, (req, res) => {
    let idUsuario = req.usuario._id;
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: idUsuario
    });

    categoria.save((err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true, 
            categoria: categoriaDB
        });
    });
});

// ACTUALIZAR UNA CATEGORIA
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, categoriaDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: `La categoría con el ${ id } no existe.`
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// BORRAR UNA CATEGORIA
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    // Solo un administrado puede borrar categorias
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!categoriaEliminada){
            return res.status(400).json({
                ok: false,
                err: {
                    message: `La categoría con el ${ id } no existe.`
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaEliminada
        });
    });
});


module.exports = app;