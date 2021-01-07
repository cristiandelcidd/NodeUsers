const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');

const fs = require('fs');
const path = require('path');

app.use( fileUpload() );

app.put( '/upload/:type/:id', ( req, res ) => {

    const type = req.params.type;
    const id = req.params.id;

    if ( !req.files || Object.keys(req.files).length === 0 ) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'No files were uploaded.'
            }
        });
    }

    const types = [ 'products', 'users' ];

    const validTypes = types.includes( type );

    if ( !validTypes  ) {
        return res.status( 400 ).json({
            ok: false,
            err: {
                message: 'Invalid type',
                validTypes: types.join( ', ' ),
                typeReceived: type
            }
        })
    }

    const file = req.files.file;
    const filenameSplit = file.name.split( '.' );
    const extension = filenameSplit[ filenameSplit.length - 1 ];

    const allowedExtensions = [ 'jpg', 'png', 'gif', 'jpeg' ];

    const validExtension = allowedExtensions.includes( extension );

    if ( !validExtension ) {
        return res.status( 400 ).json({
            ok: false,
            err: {
                message: 'Extension not allowed, file was not uploaded',
                allowedExtensions: allowedExtensions.join( ', ' ),
                ext: extension
            }
        })
    };

    const fileName = `${ id }-${ new Date().getTime() }.${ extension }`;

    file.mv(`uploads/${ type }/${ fileName }`, ( err ) => {
        if ( err )
            return res.status( 500 ).json({
                ok: false,
                err
            });

        if ( type === 'users' ) {
            userImage( id, res, fileName );
        } else if ( type === 'products' ) {
            productImage( id, res, fileName )
        }
    });
});

function userImage ( id, res, fileName ) {
    User.findByIdAndUpdate( id , { img: fileName }, ( err, userDB ) => {
        if ( err ) {
            deleteFile( fileName, 'users' );
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }

        if ( !userDB ) {
            deleteFile( fileName, 'users' );
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'The user doesn\'t exists'
                }
            })
        }

        deleteFile( userDB.img, 'users' )

        userDB.img = fileName

        res.json({
            ok: true,
            user: userDB,
            img: fileName
        })
    })
};

function productImage ( id, res, fileName ) {
    Product.findByIdAndUpdate( id, { img: fileName }, ( err, productDB ) => {
        if ( err ) {
            deleteFile( fileName, 'products' );
            return res.status( 500 ).json({
                ok: false,
                err
            })
        }

        if ( !productDB ) {
            deleteFile( fileName, 'products' );
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'The product doesn\'t exists'
                }
            })
        }

        deleteFile( productDB.img, 'products' );

        productDB.img = fileName;

        res.json({
            ok: true,
            user: productDB,
            img: fileName
        })
    })
}

function deleteFile ( imageName, type ) {
    const pathImage = path.resolve( __dirname, `../../uploads/${ type }/${ imageName }` );
    if ( fs.existsSync( pathImage ) ) {
        fs.unlinkSync( pathImage );
    }
};

module.exports = app;