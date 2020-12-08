require('./config/config');
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración global de rutas
app.use( require('./routes/index') );

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, ( err, res ) => {

    if ( err ) throw err;

    console.log( 'Database ONLINE' );
});

app.listen( process.env.PORT, () => console.log( `Listening port ${ process.env.PORT }.` ) );