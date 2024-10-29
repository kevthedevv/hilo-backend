const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the Game Schema
const gameSchema = new Schema({
     game_id: {
          type: String,   // Unique identifier for the game round
          required: true,
          unique: true
     },
     initial_number: {
          type: String,   // The starting number shown (e.g., "321")
          required: true
     },
     middle_digit: {
          type: String,   // Revealed middle digit (e.g., "2" in "x2x")
          required: true
     },
     third_digit: {
          type: String,   // Revealed third digit (e.g., "3" in "x23")
          required: true
     },
     first_digit: {
          type: String,   // Revealed first digit (e.g., "4" in "423")
          required: true
     },
     high_bets: {
          type: Number,   // Total amount of bets placed on high
          default: 0
     },
     low_bets: {
          type: Number,   // Total amount of bets placed on low
          default: 0
     },
     high_winners: {
          type: Number,   // Total amount of players who bet high and won
          default: 0
     },
     low_winners: {
          type: Number,   // Total amount of players who bet low and won
          default: 0
     },
     result: {
          type: String,   // 'High' or 'Low' depending on the winning outcome
          default: null   // Set to 'High' or 'Low' after the game ends
     },
     prize_distribution: {
          type: Map,   // Map to hold the prize distribution based on bets
          of: Number    // e.g., { "high": 1000, "low": 500 }
     },
     createdAt: {
          type: Date,
          default: Date.now   // Automatically sets the creation date
     },
     updatedAt: {
          type: Date,
          default: Date.now   // Automatically sets the update date
     }
}, {
     timestamps: true   // Automatically adds createdAt and updatedAt fields
});

// Export the Game model
module.exports = mongoose.model('Game', gameSchema);
