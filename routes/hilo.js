const express = require('express')
const router = express.Router()
const {
     createHilo,
     placeBet,
     updateGameResult
} = require('../controller/hilo_controller')



/**CREATE NEW Credentials */
router.post('/start-game', createHilo)
router.post('/place-bet', placeBet);

module.exports = router