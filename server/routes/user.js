const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

app.get( '/user', verifyToken, ( req, res ) => {

    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;

    User.find({ status: true }, 'name email role status google')
        .skip( skip )
        .limit( limit )
        .exec( ( err, users ) =>{

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

    const body = req.body;
    const saltRounds = 10;

    const user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds), // Hace la encriptacion sin el uso de promesas o callbacks.
        // password: body.password,
        role: body.role,
    });

    user.save((err, userDB) => {

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

    const id = req.params.id;
    const body = _.pick( req.body, ['name', 'email', 'img', 'role', 'status'] );

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, ( err, userDB ) => {

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

    const id = req.params.id;

    const changeStatus = {
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