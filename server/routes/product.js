const express = require('express');

const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

const Product = require('../models/product');

app.get( '/product', verifyToken,  ( req, res ) => {
    const skip = +req.query.skip || 0;

    Product.find({ available: true })
        .skip( skip )
        .limit( 5 )
        .populate( 'user', 'name email' )
        .populate( 'category', 'description' )
        .exec( ( err, products ) => {
            if ( err ) {
                return res.status( 500 ).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                products
            })
        })
});

app.get( '/product/:id', verifyToken, ( req, res ) => {
    const id = req.params.id;
    Product.findById( id )
        .populate( 'user', 'name email' )
        .populate( 'category', 'description' )
        .exec(( err, productDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !productDB ) {
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'The ID doesn\'t exist'
                }
            })
        }
        res.json({
            ok: true,
            product: productDB
        })
    })
});

app.get( '/producto/search/:term', verifyToken, ( req, res ) => {
    const term = req.params.term;
    const regex = new RegExp( term, 'i' );

    Product.find({ name: regex })
        .populate( 'category', 'description' )
        .exec(( err, products ) => {
            if ( err ) {
                return res.status( 500 ).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                products
            })
        })
});

app.post( '/product', verifyToken, ( req, res ) => {
    const body = req.body;
    const product = new Product({
        name: body.name,
        unitPrice: body.unitPrice,
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
});

app.put( '/product/:id', verifyToken, ( req, res ) => {
    const id = req.params.id;
    const body = req.body;
    Product.findById( id, ( err, productDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !productDB ) {
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'The ID doesn\'t exist'
                }
            })
        }

        productDB.name = body.name;
        productDB.unitPrice = body.unitPrice;
        productDB.description = body.description;
        productDB.available = body.available;
        productDB.category = body.category;

        productDB.save( ( err, savedProduct ) => {
            if ( err ) {
                return res.status( 500 ).json({
                    ok: false,
                    err
                })
            }

            res.status( 201 ).json({
                ok: true,
                product: savedProduct
            })
        })
    })
});

app.delete( '/product/:id', [ verifyToken, verifyAdminRole ], ( req, res ) => {
    const id = req.params.id;
    Product.findByIdAndUpdate( id, { available: false }, { new: true } )
        .populate( 'user', 'name email' )
        .populate( 'category', 'description' )
        .exec(( err, productDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !productDB ) {
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'The ID doesn\'t exist'
                }
            })
        }
        res.status( 201 ).json({
            ok: true,
            product: productDB,
            message: 'The product has been deleted'
        })
    })
});

module.exports = app;