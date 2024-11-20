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
               result: null,    // Result not available at this point
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

          req.io.emit('betPlaced', {
               game_id: game.game_id,
               high_bets: game.high_bets,
               low_bets: game.low_bets,
               betted: game.betted
          });

          const totalBets = game.high_bets + game.low_bets;
          const myBets = game.betted.filter(bet => bet.username === username);
          const totalMyHighBets = myBets
               .filter(bet => bet.bet_type === 'high')
               .reduce((acc, bet) => acc + bet.bet_amount, 0);

          const totalMyLowBets = myBets
               .filter(bet => bet.bet_type === 'low')
               .reduce((acc, bet) => acc + bet.bet_amount, 0);

          const mostRecentBetType = myBets.length > 0 ? myBets[myBets.length - 1].bet_type : null;

          res.status(200).json({
               message: 'Bet placed successfully',
               game,
               high_bets: game.high_bets,
               low_bets: game.low_bets,
               my_bets: myBets,  // Return the user's individual bets
               total_bets: totalBets,
               total_my_bets: {
                    high: totalMyHighBets,  // Return total amount of high bets
                    low: totalMyLowBets     // Return total amount of low bets
               },
               bet_type: mostRecentBetType

               //my_bets: game.betted.bet_amount
          });
     } catch (error) {
          res.status(500).json({
               error: 'Failed to place bet',
               details: error.message
          });
     }
};



const updateGameResult = async (req, res, io) => {
     const { game_id, first_digit, second_digit, third_digit } = req.body;

     console.log('Route hit: /api/hilo/update-game');

     // Validate input
     if (!game_id || first_digit == null || second_digit == null || third_digit == null) {
          return res.status(400).json({ message: 'Game ID and all digits are required' });
     }

     try {
          // Update the game and return the updated document
          const updatedGame = await Hilo.findOneAndUpdate(
               { game_id }, // Filter
               { first_digit, second_digit, third_digit }, // Update
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
          });
     } catch (error) {
          console.error('Failed to update game result:', error);
          res.status(500).json({
               error: 'Failed to update the game result',
               details: error.message,
          });
     }
};



// const updateGameResult = async (req, res, io) => {
//      const { game_id, first_digit, second_digit, third_digit } = req.body;

//      try {
//           // Find the game by game_id
//           const game = await Hilo.findOne({ game_id });

//           if (!game) {
//                return res.status(404).json({ message: 'Game not found' });
//           }

//           // Check if all digits have been provided
//           if (!first_digit || !second_digit || !third_digit) {
//                return res.status(400).json({ message: 'All digits must be provided to finalize the game' });
//           }

//           // Update the digits in the game document
//           game.first_digit = first_digit;
//           game.second_digit = second_digit;
//           game.third_digit = third_digit;

//           // Calculate the current number from the digits
//           const currentNumber = parseInt(first_digit) * 100 + parseInt(second_digit) * 10 + parseInt(third_digit);

//           // Retrieve the previous game result, if any
//           const previousGame = await Hilo.findOne().sort({ createdAt: -1 }).limit(1); // Find the most recent game

//           let result = null;

//           // If there is a previous game, compare the numbers
//           if (previousGame) {
//                const previousNumber = parseInt(previousGame.first_digit || '0') * 100 + parseInt(previousGame.second_digit || '0') * 10 + parseInt(previousGame.third_digit || '0');

//                // Compare the current and previous numbers to determine the result
//                if (currentNumber > previousNumber) {
//                     result = 'High';
//                } else if (currentNumber < previousNumber) {
//                     result = 'Low';
//                } else {
//                     result = 'Same'; // If both numbers are equal
//                }
//           } else {
//                // If no previous game exists (first game), we can set a default result or leave it as null
//                result = 'N/A';  // Or leave as null if you don't want to assign a result for the first game
//           }

//           // Update the result in the game
//           game.result = result;

//           // Determine winners based on the result and update the winners count
//           if (result === 'High') {
//                game.high_winners = game.betted.filter(bet => bet.result === 'High').length;
//           } else if (result === 'Low') {
//                game.low_winners = game.betted.filter(bet => bet.result === 'Low').length;
//           }

//           // Save the updated game
//           await game.save();

//           req.io.emit('gameResult', {
//                game_id: game.game_id,
//                result: game.result,
//                high_bets: game.high_bets,
//                low_bets: game.low_bets
//           });

//           res.status(200).json({
//                message: 'Game result updated successfully',
//                game
//           });
//      } catch (error) {
//           res.status(500).json({
//                error: 'Failed to update the game result',
//                details: error.message
//           });
//      }
// };


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
