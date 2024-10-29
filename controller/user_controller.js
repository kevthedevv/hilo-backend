const { default: mongoose } = require('mongoose')
const Credentials = require('../model/user_model.js')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
     return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' })
}


const loginUser = async (req, res) => {
     const { username, password } = req.body
     try {
          const user = await Credentials.login(username, password)

          //create a token
          const token = createToken(user._id)

          res.status(200).json({ username, token })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}


const signupUser = async (req, res) => {
     // Extract all required fields from the request body
     const { firstname, lastname, username, contact_number, email, password } = req.body;

     try {
          // Call the signup method with all required fields
          const user = await Credentials.signup(firstname, lastname, username, contact_number, email, password);

          // Create a token
          const token = createToken(user._id);

          // Respond with status 201 for created and return the user's details
          res.status(201).json({ username, token });
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
};

module.exports = {
     signupUser,
     loginUser
}