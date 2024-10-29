const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema({
     firstname: {
          type: String,
     },
     lastname: {
          type: String,
     },
     username: {
          type: String,
          required: true,
          unique: true    // Ensures no duplicate usernames
     },
     contact_number: {
          type: String,
     },
     email: {
          type: String,
          required: true,
          unique: true    // Ensures no duplicate emails
     },
     password: {
          type: String,
          required: true  // The password will be stored (hashed for security)
     },
     balance: {
          type: Number,   // Player's current balance (credits)
          default: 0      // Default balance is 0
     },
     bet_history: [
          {
               game_id: {
                    type: Schema.Types.ObjectId,  // Reference to the game played
                    ref: 'Game'  // Assuming you have a Game model to reference
               },
               bet_amount: {
                    type: Number,  // Total amount bet
                    required: true  // Ensure this field is required
               },
               numbers_bet_on: {
                    type: [Number],  // Numbers the player bet on
                    required: true  // Ensure this field is required
               },
               bet_type: {
                    type: String,  // e.g., 'Straight', 'Ramble', 'Last 2 Digits'
                    required: true  // Ensure this field is required
               },
               outcome: {
                    type: String,  // e.g., 'Win', 'Lose'
                    default: null  // Default to null until the outcome is determined
               },
               payout: {
                    type: Number,  // Amount won, if applicable
                    default: 0     // Default payout is 0
               },
               date: {
                    type: Date,
                    default: Date.now  // Automatically sets the date when the bet is placed
               }
          }
     ],
     registration_date: {
          type: Date,
          default: Date.now  // Automatically sets the registration date
     },
     status: {
          type: String,     // Active, Suspended, etc.
          default: 'Active' // Default status is active
     }
}, {
     timestamps: true  // Automatically adds createdAt and updatedAt
});

userSchema.statics.signup = async function (firstname, lastname, username, contact_number, email, password) {
     // Validate that all required fields are filled
     if (!username || !email || !password) {
          throw Error('All required fields (username, email, password) must be filled');
     }

     const usernameExists = await this.findOne({ username });
     if (usernameExists) {
          throw Error('Username already in use');
     }

     const emailExists = await this.findOne({ email });
     if (emailExists) {
          throw Error('Email already registered');
     }

     const salt = await bcrypt.genSalt(10);
     const hash = await bcrypt.hash(password, salt);

     const user = await this.create({
          firstname,
          lastname,
          username,
          email,
          contact_number,
          password: hash
     });

     return user;
};

userSchema.statics.login = async function (username, password) {
     // Validate that both fields are provided
     if (!username || !password) {
          throw Error('All fields must be filled');
     }

     const user = await this.findOne({ username });
     if (!user) {
          throw Error('Incorrect username or password');
     }

     const match = await bcrypt.compare(password, user.password);
     if (!match) {
          throw Error('Incorrect username or password');
     }

     return user;
};

module.exports = mongoose.model('User', userSchema);