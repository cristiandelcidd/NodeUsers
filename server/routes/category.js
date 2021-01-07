const express = require('express');

const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

const Category = require('../models/category')

// Show all the categories
app.get( '/category', verifyToken, ( req, res ) => {
    Category.find({})
        .sort({ description: 'asc' })
        .populate( 'user', 'name email' )
        .exec(( err, categories ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categories
        })
    })
})

// Show a category by id
app.get( '/category/:id', verifyToken, ( req, res ) => {
    const id = req.params.id;
    Category.findById( id, ( err, categoryDB ) => {
        if( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !categoryDB ) {
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'Item not found'
                }
            })
        }

        res.json({
            ok: true,
            category: categoryDB
        })
    })
})

// Create a new category
app.post( '/category', verifyToken, ( req, res ) => {
    const body = req.body;
    const category = new Category({
        description: body.description,
        user: req.user._id
    })

    category.save( ( err, categoryDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !categoryDB ) {
            return res.status( 400 ).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            category: categoryDB
        })
    })
})

// Update a category
app.put( '/category/:id', verifyToken, ( req, res ) => {
    const id = req.params.id;
    const body = req.body;
    const categoryDescription = {
        description: body.description
    }

    Category.findByIdAndUpdate( id, categoryDescription, { new: true, runValidators: true }, ( err, categoryDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !categoryDB ) {
            return res.status( 400 ).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            category: categoryDB
        })
    })
})

// Delete a category
app.delete( '/category/:id', [ verifyToken, verifyAdminRole ], ( req, res ) => {
    const id = req.params.id;

    Category.findByIdAndRemove( id, ( err, categoryDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }
        if ( !categoryDB ) {
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'The id doesn\'t exist'
                }
            })
        }

        res.json({
            ok: true,
            message: 'The category has been removed'
        })
    })
})

module.exports = app;