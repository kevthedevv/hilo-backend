const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: { type: Number, default: 1 }  // Start from 1 to make the first game_id 000000000001
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;