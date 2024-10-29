require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require("cors");
const user_route = require('./routes/user')
const app = express()


app.use((req, res, next) => {
     res.setHeader('Access-Control-Allow-Origin', '*');
     //res.header("Access-Control-Allow-Origin", "http://localhost:3000");
     //res.header("Access-Control-Allow-Origin", "https://coop-2af5d.web.app");
     res.header("Access-Control-Allow-Origin", "https://chrome.browserless.io/screenshot") // new. remove it if not working
     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
     res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
     res.setHeader("Access-Control-Allow-Credentials", "true");
     res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
     next();
})
app.use(cors({ origin: true })); // enable origin cors

app.use((req, res, next) => {
     console.log('I am detecting a request - MIDDLEWARE')
     next();
})
app.use(express.json())

app.use('/api/user', user_route)


mongoose.connect(process.env.MONGO_URI)
     .then(() => {
          app.listen(process.env.PORT || 5000, () => {
               console.log(`Connected to DB and Listening to port ${process.env.PORT}`)
          })

     })
     .catch((error) => {
          console.log(error)
     })