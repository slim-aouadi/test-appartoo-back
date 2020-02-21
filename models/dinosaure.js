const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DinosaureSchema = new Schema({
    login: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        trim: true,
    },
    famille: {
        type: String,
        trim: true,
    },
    race: {
        type: String,
        trim: true,
    },
    nourriture: {
        type: String,
        trim: true,
    },
    profileImage: { type: String, default: 'https://res.cloudinary.com/appartoo/image/upload/v1581898724/kisspng-tyrannosaurus-monster-dinosaur-cartoon-drawing-dino-5ac536bb937eb2.7909235515228740436042_te7xey.jpg' },


    friends: [{ type: mongoose.Schema.ObjectId, ref: 'Dinosaure' }]

});

module.exports = mongoose.model('Dinosaure', DinosaureSchema);