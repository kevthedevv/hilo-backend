const express = require('express')
const router = express.Router()
const {
     createNewGame,
     placeBet,
     updateGameResult
} = require('../controller/hilo_controller')



/**CREATE NEW Credentials */
router.post('/start-game', createNewGame)
router.patch('/place-bet', placeBet);
router.patch('/update-game', updateGameResult);

module.exports = router