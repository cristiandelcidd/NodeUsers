const jwt = require('jsonwebtoken');
// =====================
// Verify Token
// =====================

const verifyToken = ( req, res, next ) => {
    const token = req.get('token'); // Header en nuestras peticiones

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

// =====================
// Verify ADMIN_ROLE
// =====================

const verifyAdminRole = ( req, res, next ) => {
    const user = req.user;

    if ( user.role === 'ADMIN_ROLE' ) {
        next();
        return;
    }

    return res.json({
        ok: false,
            err: {
                message: 'User must be an administrator.'
            }
    });
};

// =====================
// Verify Token Img
// =====================

const verifyTokenImg = ( req, res, next ) => {
    const { token } = req.query;

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
    verifyToken,
    verifyAdminRole,
    verifyTokenImg
};