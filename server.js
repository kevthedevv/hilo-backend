require('dotenv').config()

const express = require('express')
const http = require('http');
const socketIo = require('socket.io');
const app = express()
const server = http.createServer(app);

const mongoose = require('mongoose')
const cors = require("cors");
const user_route = require('./routes/user')
const hilo_route = require('./routes/hilo')

const io = socketIo(server, {
     cors: {
          origin: '*', // Allow all origins (you can restrict to specific origins as needed)
          methods: ['GET', 'POST']
     }
});


app.use((req, res, next) => {
     res.setHeader('Access-Control-Allow-Origin', '*');
     //res.header("Access-Control-Allow-Origin", "http://localhost:3000");
     //res.header("Access-Control-Allow-Origin", "https://coop-2af5d.web.app");
     res.header("Access-Control-Allow-Origin", "https://chrome.browserless.io/screenshot") // new. remove it if not working
     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
     res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
     res.setHeader("Access-Control-Allow-Credentials", "true");
     res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
     req.io = io;
     next();
})
app.use(cors({ origin: true })); // enable origin cors

app.use((req, res, next) => {
     console.log('I am detecting a request - MIDDLEWARE')
     next();
})
app.use(express.json())

app.use('/api/user', user_route)
app.use('/api/hilo', hilo_route)




let seconds = 60; // Initial countdown value
// let gameId; // Store the current game ID

io.on('connection', (socket) => {
     console.log('A user connected');

     socket.on('newGame', (data) => { //received from the client to start the timer
          gameId = data.game_id; // Set the current game_id
          startGameTimer(); // Start the timer
     });

     socket.on('restartTimer', () => {
          console.log('Restarting the game timer...');
          resetGameTimer(); // Reset game state
          startGameTimer(); // Restart the timer
     });

     socket.on('disconnect', () => {
          console.log('A user disconnected');
     });

     function startGameTimer() {
          const interval = setInterval(() => {
               seconds -= 1;
               io.emit('timerUpdate', { seconds }); // Broadcast timer update to all clients
               // io.emit('timerUpdate', { seconds, gameId }); // Broadcast timer update to all clients
               if (seconds <= 0) {
                    clearInterval(interval);
                    io.emit('restartTimer', true)
                    resetGameTimer(); // Reset game state for the next round
               }
          }, 1000);
     }

     function resetGameTimer() {
          seconds = 60; // Reset the timer
          // gameId = null; // Clear the current game ID
          // // Reset any other game state variables if needed
     }
});




mongoose.connect(process.env.MONGO_URI)
     .then(() => {
          server.listen(process.env.PORT || 5000, () => {
               console.log(`Connected to DB and Listening to port ${process.env.PORT}`)
          })

     })
     .catch((error) => {
          console.log(error)
     })