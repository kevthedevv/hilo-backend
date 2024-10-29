const express = require('express')
const router = express.Router()
const {
     loginUser,
     signupUser,
     getAllUsers
} = require('../controller/user_controller')



/**CREATE NEW Credentials */
router.post('/login', loginUser)

/**GET ALL CredentialsS */
router.post('/signup', signupUser)
router.get('/users', getAllUsers); // Add this route for GET request


module.exports = router