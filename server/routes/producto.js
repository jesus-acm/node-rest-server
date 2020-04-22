const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

//============================
// Obtener productos
//============================
app.get('/productos', verificaToken, (req, res) => {
    // Trae todos los productos
    // Populate: usuario categoria
    // paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({disponible: true})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'email nombre')
            .populate('categoria', 'descripcion')
            .exec((err, productos) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                
                Producto.countDocuments({disponible: true}, (err, count) => {

                    res.json({
                        ok: true,
                        producto: productos,
                        total: count
                    });
                });
            });
});


//============================
// Obtener un producto por ID
//============================
app.get('/productos/:id', verificaToken, (req, res) => {
    // Populate: usuario categoria
    let id = req.params.id;

    Producto.findById(id)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'descripcion')
            .exec((err, productoDB) => {
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                if(!productoDB){
                    return res.status(404).json({
                        ok: false,
                        err: {
                            mensaje: `El producto con el id=${ id } no existe.`
                        }
                    })
                }

                res.json({
                    ok: true,
                    producto: productoDB
                });
            });
});

//============================
// Buscar productos
//============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
            .populate('categoria', 'nombre')
            .exec((err, productosDB) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                
                res.json({
                    ok: true,
                    producto: productosDB
                });
            });
});

//============================
// Crear un producto por ID
//============================
app.post('/productos', verificaToken, (req, res) => {
    // Grabar el usuario
    // Grabar una categoria del listado
    let id = req.usuario._id;
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: id
    });

    producto.save((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//============================
// Actualizar un producto por ID
//============================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoDB) => {
        
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            return res.status(404).json({
                ok: false,
                err: {
                    mensaje: `El producto con el id=${ id } no existe.`
                }
            });
        }else{
            return res.status(202).json({
                ok: true,
                producto: productoDB
            });
        }
    });
});

//============================
// Borrar un producto por ID
//============================
app.delete('/productos/:id', verificaToken, (req, res) => {
    // Disponible = false
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, {disponible: false}, {new: true}, (err, productoBorrado) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoBorrado){
            return res.status(404).json({
                ok: false,
                err: {
                    mensaje: `El producto con el id=${ id } no existe.`
                }
            });
        }else{
            return res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        }
    });
});

module.exports = app;