require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const User = require('../models/user');

const app = express();

app.post( '/login', ( req, res ) => {

    const body = req.body;

    User.findOne({ email: body.email }, ( err, userDB ) => {
        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                error
            });
        }

        if ( !userDB ) {
            return res.status( 400 ).json({
                ok: false,
                error: {
                    message: '(User) or password incorrect.'
                }
            });
        };

        if ( bcrypt.compareSync( body.password, userDB.password ) ) {
            return res.status( 400 ).json({
                ok: false,
                error: {
                    message: 'User or (password) incorrect.'
                }
            });
        };

        const token = jwt.sign({
            user: userDB
        }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

        res.json({
            ok: true,
            user: userDB,
            token
        });
    });
});

// Google configurations
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
};

app.post( '/google', async ( req, res ) => {

    const token = req.body.idtoken;

    const googleUser = await verify( token )
        .catch( e => {
            return res.status( 403 ).json({
                ok: false,
                err: e
            });
        });

    User.findOne({ email: googleUser.email }, ( err, userDB ) => {

        if ( err ) {
            return res.status( 500 ).json({
                ok: false,
                err
            });
        }

        if ( userDB ) {
            if ( userDB.google === false ) {
                return res.status( 400 ).json({
                    ok: false,
                    err : {
                        message: 'It must be a normal authentication'
                    }
                });
            } else {
                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            }
        } else {
            // if the user does not exist in our database
            let user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save( ( err, userDB ) =>{
                if ( err ) {
                    return res.status( 500 ).json({
                        ok: false,
                        err
                    })
                };

                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            });
        }
    });
});

module.exports = app;