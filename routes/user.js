const express = require('express')
const router = express.Router()
const {
     loginUser,
     signupUser,
} = require('../controller/user_controller')



/**CREATE NEW Credentials */
router.post('/login', loginUser)

/**GET ALL CredentialsS */
router.post('/signup', signupUser)



module.exports = router