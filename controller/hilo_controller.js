const { default: mongoose } = require('mongoose')
const Hilo = require('../model/hilo_model')
const Counter = require('../model/counter_model')


//Create the document once the game start.


const createNewGame = async (req, res, io) => {
     const { game_id } = req.body;  // No digits provided yet, just the game ID
     try {

          const counter = await Counter.findOneAndUpdate(
               { name: 'game_id' }, // Find the game_id counter
               { $inc: { count: 1 } }, // Increment the count by 1
               { new: true, upsert: true } // Return the updated counter, and create one if it doesn't exist
          );

          const game_id = counter.count.toString().padStart(15, '0');
          // Create a new game without digits (only game_id and initial values)
          const newGame = await Hilo.create({
               game_id,
               first_digit: 0,
               second_digit: 0,
               third_digit: 0,
               high_bets: 0,
               low_bets: 0,
               high_winners: 0,
               low_winners: 0,
               result: null,    // high or low - Result not available at this point
               betted: []       // No bets placed yet
          });

          req.io.emit('newGame', { game_id: newGame.game_id }); // use the game_id and send out to all users
          res.status(200).json({
               message: 'Game started successfully',
               game_id: newGame.game_id // return the game_id to the frontend.
          });
     } catch (error) {
          res.status(500).json({
               error: 'Failed to start the game',
               details: error.message
          });
     }
};
const placeBet = async (req, res, io) => {
     const { game_id, username, bet_amount, bet_type } = req.body;

     try {
          // Find the game by game_id
          const game = await Hilo.findOne({ game_id });

          if (!game) {
               return res.status(404).json({ message: 'Game not found' });
          }

          // Add the new bet to the betted array
          game.betted.push({ username, bet_amount, bet_type });

          // Update the high and low bets based on the player's bet
          if (bet_type === 'high') {
               game.high_bets += bet_amount;
          } else if (bet_type === 'low') {
               game.low_bets += bet_amount;
          }

          // Save the updated game
          await game.save();

          // Calculate total pool of bets
          const totalBets = game.high_bets + game.low_bets;

          // Calculate potential payout odds for both sides
          const highPayoutOdds = totalBets / (game.high_bets || 1); // Avoid division by zero
          const lowPayoutOdds = totalBets / (game.low_bets || 1); // Avoid division by zero

          // Calculate the user's potential payout based on their latest bet
          const potentialPayout = bet_type === 'high'
               ? bet_amount * highPayoutOdds
               : bet_amount * lowPayoutOdds;

          // Emit updated info to all clients
          req.io.emit('betPlaced', {
               game_id: game.game_id,
               high_bets: game.high_bets,
               low_bets: game.low_bets,
               payout_odds: {
                    high: highPayoutOdds.toFixed(2),
                    low: lowPayoutOdds.toFixed(2),
               },
               potential_payout: potentialPayout.toFixed(2), // User's potential payout
          });

          res.status(200).json({
               message: 'Bet placed successfully',
               game,
               high_bets: game.high_bets,
               low_bets: game.low_bets,
               total_bets: totalBets,
               payout_odds: {
                    high: highPayoutOdds.toFixed(2),
                    low: lowPayoutOdds.toFixed(2),
               },
               potential_payout: potentialPayout.toFixed(2), // Include user's potential payout
          });
     } catch (error) {
          res.status(500).json({
               error: 'Failed to place bet',
               details: error.message
          });
     }
};

const updateGameResult = async (req, res, io) => {
     console.log("UUUUUUUUUUPDATE BACKEND")
     const { game_id, first_digit, second_digit, third_digit, result } = req.body;

     console.log('Route hit: /api/hilo/update-game');

     // Validate input
     if (!game_id || first_digit == null || second_digit == null || third_digit == null) {
          return res.status(400).json({ message: 'Game ID and all digits are required' });
     }

     try {
          // Update the game and return the updated document
          const updatedGame = await Hilo.findOneAndUpdate(
               { game_id }, // Filter
               { first_digit, second_digit, third_digit, result }, // Update
               { new: true, runValidators: true } // Options
          );

          if (!updatedGame) {
               return res.status(404).json({ message: 'Game not found' });
          }

          // Optionally notify clients via `io`
          req.io.emit('gameUpdated', updatedGame);


          // Respond with the updated document
          res.status(200).json({
               first_digit: updatedGame.first_digit,
               second_digit: updatedGame.second_digit,
               third_digit: updatedGame.third_digit,
               result: updatedGame.result
          });
     } catch (error) {
          console.error('Failed to update game result:', error);
          res.status(500).json({
               error: 'Failed to update the game result',
               details: error.message,
          });
     }
};



//update the document everytime the user bets. 
//const updateHilo = 
const updateHilo = async (req, res) => {
     const {
          gameId,  // Unique identifier for the game (use the initial number or another field)
          high_bets,
          low_bets,
          high_winners,
          low_winners,
          result,
     } = req.body;

     try {
          // Find the document by the unique game identifier (gameId), then update the fields.
          const hilo = await Hilo.findOneAndUpdate(
               { initial_number: gameId },  // Condition to find the game (you can use a different unique identifier)
               {
                    $set: {
                         high_bets,
                         low_bets,
                         high_winners,
                         low_winners,
                         result
                    }
               },
               { new: true }  // Option to return the updated document
          );

          if (!hilo) {
               return res.status(404).json({ error: "Game not found" });
          }

          res.status(200).json(hilo);  // Respond with the updated document
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
};
module.exports = {
     createNewGame,
     updateHilo,
     placeBet,
     updateGameResult
}
