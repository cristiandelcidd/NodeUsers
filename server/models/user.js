const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const validsRoles = {
    values: [ 'ADMIN_ROLE', 'USER_ROLE' ],
    message: '{VALUE} is not a valid role.'
};

// const { Schema } = mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [ true, 'Name is required.' ]
    },
    email: {
        type: String,
        unique: true,
        required: [ true, 'Email is required.' ]
    },
    password: {
        type: String,
        required: [ true, 'Password is required.' ]
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: validsRoles
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
};

userSchema.plugin( uniqueValidator, { message: 'Error, expected {PATH} to be unique.' } );

module.exports = mongoose.model( 'User', userSchema );