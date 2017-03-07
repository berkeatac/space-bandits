var scoreBoard = [];
var shX, shY, shW, shH;

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();
var typeCounter = 0;
// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

var shape_info = {
    "x": 100,
    "y": 100,
    "w": 0,
    "h": 0
};

// This call back just tells us that the server has started
function listen() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function(socket) {

        //player json to hold data
        var player = {
            "id": socket.id,
            "score": 0,
            "name": "noName",
            "type": typeCounter
        };
        typeCounter = (typeCounter+1)%4;
        scoreBoard.push(player);

        console.log("We have a new client: " + socket.id);

        // When this user emits, client side: socket.emit('otherevent',some data);
        socket.on('mouse', function(data) {
            // Data comes in as whatever was sent, including objects
            //console.log("Received: 'mouse' " + data.x + " " + data.y);

            for (var i = 0; i < scoreBoard.length; i++) {
                if (scoreBoard[i].id == socket.id) {
                    data.un = scoreBoard[i].name;
                    data.type = scoreBoard[i].type;
                }
            }

            // Send the incoming mouse data from user to other users
            // This way they can draw them in their browsers
            socket.broadcast.emit('mouse', data);

            //update the scoreboard depending on the incoming mouse data from user
            if (data.x < shX + shW / 2 && data.x > shX - shW / 2 && data.y < shY + shH / 2 && data.y > shY - shH / 2) {
                for (var i = 0; i < scoreBoard.length; i++) {
                    var data = scoreBoard[i];
                    if (data.id == socket.id) {
                        if (player.name != "noName") {
                            scoreBoard[i].score++;
                            shape_info.w--;
                            shape_info.h--;
                        } // ensures player has selected a name
                    }
                }
            }
        });

        //When a username is received from the user, replace it in scoreboard
        socket.on('username', function(incName) {
            for (var i = 0; i < scoreBoard.length; i++) {
                if (scoreBoard[i].id == socket.id) {
                    scoreBoard[i].name = incName.name;
                }
            }
        });

        //when a player disconnects, delete it from the scoreBoard
        //and send a signal for clients to delete it locally
        socket.on('disconnect', function() {
            console.log("Client has disconnected");
            for (var i = 0; i < scoreBoard.length; i++) {
                var data = scoreBoard[i];
                if (data.id == socket.id) {
                    scoreBoard.splice(i, 1);
                }
            }
            socket.broadcast.emit('disconnectedUser', player);
        });

        //When a reset scores signal comes
        socket.on('resetScores', function() {
            for (var i = 0; i < scoreBoard.length; i++) {
                scoreBoard[i].score = 0;
            }
        });
    }
);

//function to send scoreboard to players
var scoreFunc = function() {
    var scores = "";

    scoreBoard.sort(function(a, b) {
        return parseFloat(b.score) - parseFloat(a.score);
    });

    for (var i = 0; i < scoreBoard.length; i++) {
        var data = scoreBoard[i];
        var sc = data.score.toString();
        scores = scores + (i + 1).toString() + ". " + data.name + " : " + sc + "<br>";
    }

    var scoreJ = {
        "score": scores
    }
    io.sockets.emit('score', scoreJ);
}

//function that generates a shape and sends to players
var shape = function() {
    if(shape_info.w < 60)
    {
      var x = Math.floor((Math.random() * 700) + 100);
      var y = Math.floor((Math.random() * 700) + 100);
      var w = Math.floor((Math.random() * 60) + 100);
      var h = w; // for circles only
      var type = Math.floor(Math.random() * 2);
      shape_info = {
          "x": x,
          "y": y,
          "w": w,
          "h": h,
          "type": type
      };
      shX = x;
      shY = y;
      shW = w;
      shH = h;
  }
}

function sendShapeInfo(){
  shW = shape_info.w;
  shH = shW;
  io.sockets.emit('shape', shape_info);
}

//execute functions in intervals
setInterval(sendShapeInfo, 100);
setInterval(shape, 100);
setInterval(scoreFunc, 100);
