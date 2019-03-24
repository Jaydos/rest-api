'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {type: String, required: 'First name is required'},
    lastName: {type: String, required: 'Last name is required'},
    emailAddress: {type: String, required: 'Email is required'},
    password: {type: String, required: 'Password is required'},
});


module.exports = mongoose.model('User', UserSchema);