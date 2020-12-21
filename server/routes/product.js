const express = require('express');

const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

const Product = require('../models/product');

app.get( '/product', verifyToken,  ( req, res ) => {

})

app.get( '/product/:id', verifyToken, ( req, res ) => {

})

app.post( '/product', verifyToken, ( req, res ) => {
    const body = req.body;
    const product = new Product({
        name: body.name,
        unitPrice: body.price,
        description: body.description,
        available: body.available,
        category: body.category,
        user: req.user._id
    })
    product.save( ( err, productDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !productDB ) {
            return res.status( 400 ).json({
                ok: false,
                err
            })
        }
        res.status( 201 ).json({
            ok: true,
            product: productDB
        })
    })
})

app.put( '/product/:id', verifyToken, ( req, res ) => {

})
app.delete( '/product/:id', [ verifyToken, verifyAdminRole ], ( req, res ) => {

})

module.exports = app;