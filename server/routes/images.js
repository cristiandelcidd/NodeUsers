const express= require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const { verifyTokenImg } = require('../middlewares/auth');

app.get( '/image/:type/:img', verifyTokenImg, ( req, res ) => {
    const { type, img } = req.params;

    const pathImage = path.resolve( __dirname, `../../uploads/${ type }/${ img }` );

    if ( fs.existsSync( pathImage ) ) {
        res.sendFile( pathImage );
    } else {
        const noImagePath = path.resolve( __dirname, '../assets/no-image.jpg' );
        res.sendFile( noImagePath );
    }
});

module.exports = app;