const jwt = require('jsonwebtoken');
// =====================
// Verify Token
// =====================

let verifyToken = ( req, res, next ) => {

    let token = req.get('token'); // Header en nuestras peticiones

    jwt.verify( token, process.env.SEED, ( err, decoded ) => {
        if ( err ) {
            return res.status( 401 ).json({
                ok: false,
                err
            })
        }

        req.user = decoded.user;
        next();
    });
};

module.exports = {
    verifyToken
};