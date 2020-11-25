const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const User = require('../models/user');

const app = express();
const saltRounds = 10;

app.get( '/user', ( req, res ) => {

    let skip = +req.query.skip || 0;
    let limit = +req.query.limit || 0;

    User.find({})
        .skip( skip )
        .limit( limit )
        .exec( ( err, users ) =>{
            if ( err ) {
                return res.status( 400 ).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                users
            })
        })

});

app.post( '/user', ( req, res ) => {

    let body = req.body;

    let user = new User({
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
        })
    })

    // if ( body.nombre === undefined ) {

    //     res.status( 400 ).json({
    //         ok: false,
    //         message: 'Name is required.'
    //     })

    // } else {
    //     res.json({
    //         person: body
    //     });
    // };

});

app.put( '/user/:id', ( req, res ) => {

    let id = req.params.id;
    let body = _.pick( req.body, ['name', 'email', 'img', 'role', 'status'] );

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, ( err, userDB ) =>{

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

app.delete( '/user', ( req, res ) => {
    res.json( 'delete user' );
});

module.exports = app;