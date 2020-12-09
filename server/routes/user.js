const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

// const errorStatus = ( error, res ) => {
//     if ( error ) {
//         return res.status( 400 ).json({
//             ok: false,
//             error
//         });
//     }
// };

app.get( '/user', verifyToken, ( req, res ) => {

    // return res.json({
    //     user: req.user,
    //     name: req.user.name,
    //     email: req.user.email
    // })

    let skip = +req.query.skip || 0;
    let limit = +req.query.limit || 0;

    User.find({ status: true }, 'name email role status google')
        .skip( skip )
        .limit( limit )
        .exec( ( err, users ) =>{

            // errorStatus( err, res );
            if ( err ) {
                return res.status( 400 ).json({
                    ok: false,
                    err
                });
            }

            User.countDocuments({ status: true }, ( err, count ) => {
                res.json({
                    ok: true,
                    users,
                    count
                })
            });
        });
});

app.post( '/user', [ verifyToken, verifyAdminRole ], ( req, res ) => {

    let body = req.body;
    const saltRounds = 10;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds), // Hace la encriptacion sin el uso de promesas o callbacks.
        // password: body.password,
        role: body.role,
    });

    user.save((err, userDB) => {

        // errorStatus( err, res );
        if ( err ) {
            return res.status( 400 ).json({
                ok: false,
                err
            });
        }

        // user.password = null // No permite no mostrar el hash de contraseña al crear el usuario.

        res.json({
            ok: true,
            user: userDB
        });
    });
});

app.put( '/user/:id', [ verifyToken, verifyAdminRole ], ( req, res ) => {

    let id = req.params.id;
    let body = _.pick( req.body, ['name', 'email', 'img', 'role', 'status'] );

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, ( err, userDB ) => {

        // errorStatus( err, res );
        if ( err ) {
            return res.status( 400 ).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });
    })
});

app.delete( '/user/:id', [ verifyToken, verifyAdminRole ], ( req, res ) => {

    let id = req.params.id;

    // User.findByIdAndRemove(id, ( err, userDeleted ) => {

    let changeStatus = {
        status: false
    }

    User.findByIdAndUpdate(id, changeStatus, { new: true }, ( err, userDeleted ) => {

        // errorStatus( err, res );
        if ( err ) {
            return res.status( 400 ).json({
                ok: false,
                err
            });
        }

        if ( !userDeleted ) {
            return res.status( 400 ).json({
                ok: false,
                err: {
                    message: 'User not found...'
                }
            });
        }

        res.json({
            ok: true,
            user: userDeleted
        });
    });
});

module.exports = app;