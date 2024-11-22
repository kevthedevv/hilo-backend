let seconds = 60;
let rumbleInterval;
let isRumbling = false;
let randomNumberLocal;
let first, second, third;

function startRumbling(io) {
     if (isRumbling) return; // Avoid multiple intervals
     isRumbling = true;

     rumbleInterval = setInterval(() => {
          const randomNumber = Math.floor(Math.random() * 10); // Generate a random number between 0-9
          io.emit('rumbleUpdate', { randomNumber });
          randomNumberLocal = randomNumber
     }, 50);
}

function stopRumbling() {
     clearInterval(rumbleInterval);
     isRumbling = false;
}

function resetGameTimer() {
     seconds = 60;
}
function startGameTimer(io) {
     const interval = setInterval(() => {
          seconds -= 1;
          let left = seconds - 40;

          // Broadcast timer updates to all clients
          io.emit('timerUpdate', { seconds });

          // Handle rumbling and messages based on the current timer
          if (seconds <= 40 && seconds > 35) {
               if (seconds === 40) {
                    io.emit('drawMessage', { message: "Drawing First Result" });
                    startRumbling(io);
               }
          } else if (seconds <= 35 && seconds > 30) {
               if (seconds === 35) {
                    io.emit('drawMessage', { message: "First Result" });
                    stopRumbling();
                    io.emit('result2', { randomNumber: randomNumberLocal });
                    second = randomNumberLocal;
               }
          } else if (seconds <= 30 && seconds > 25) {
               if (seconds === 30) {

                    io.emit('drawMessage', { message: "Drawing Second Result" });
                    startRumbling(io);
               }
          } else if (seconds <= 25 && seconds > 20) {
               if (seconds === 25) {
                    io.emit('drawMessage', { message: "Second Result" });
                    stopRumbling();

                    io.emit('result3', { randomNumber: randomNumberLocal });
                    third = randomNumberLocal;
               }
          } else if (seconds <= 20 && seconds > 15) {
               if (seconds === 20) {

                    io.emit('drawMessage', { message: "Last Result. Betting now closed" });
                    startRumbling(io);
               }
          } else if (seconds <= 15 && seconds > 10) {
               if (seconds === 15) {
                    io.emit('drawMessage', { message: "Last Result" });
                    stopRumbling();
                    io.emit('result1', { randomNumber: randomNumberLocal });
                    first = randomNumberLocal;
               }
          } else if (seconds <= 10 && seconds > 1) {
               if (seconds === 10) {
                    io.emit('showResult', true);
                    stopRumbling();

                    const combinedCurrent = first * 100 + second * 10 + third;
                    if (combinedCurrent >= 0 && combinedCurrent <= 499) {
                         io.emit('drawMessage', { message: "LOWER WINS" });
                         io.emit('higherLower', { highlow: "lower" });
                    } else {
                         io.emit('drawMessage', { message: "HIGHER WINS" });
                         io.emit('higherLower', { highlow: "higher" });
                    }
                    setTimeout(() => {
                         io.emit('drawMessage', { message: "Distributing wins. New Game Starting Soon" });
                    }, 2000); // 2 seconds duration

               }

          } else if (seconds <= 60 && seconds > 40) {
               io.emit('drawMessage', { message: "Start Betting now! First draw will start in" + " " + left })
               io.emit('countdownToDraw', { left });
          } else if (seconds <= 0) {
               clearInterval(interval);
               console.log("Game Over - emitting event");
               io.emit('gameOver');
               resetGameTimer();
          }
     }, 1000);
}



module.exports = {
     startRumbling,
     startGameTimer
}