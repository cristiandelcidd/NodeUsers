const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schemaCategory = new Schema({
    description: {
        type: String,
        unique: true,
        required: [ true, 'Description is required' ]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    versionKey: false
});

module.exports = mongoose.model( 'Category', schemaCategory );