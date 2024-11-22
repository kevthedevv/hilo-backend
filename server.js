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
const { startRumbling, startGameTimer } = require('./engines/hilo_engine');

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



//All client's(UI) emit receiver to handles the event.
io.on('connection', (socket) => {
     socket.on('newGame', (data) => { //received from the client to start the timer
          startGameTimer(socket, io);
          startRumbling(socket, io); // Start the timer
     });

     socket.on('disconnect', () => {
          console.log('A user disconnected');
     });
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