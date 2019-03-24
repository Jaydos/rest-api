'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const CourseSchema = new Schema({
    user: [{type: ObjectId, ref: 'User'}],
    title: {type: String, required: 'Course title required'},
    description: {type: String, required: "Course description required"},
    estimatedTime: String,
    materialsNeeded: String
});


module.exports = mongoose.model('Course', CourseSchema);