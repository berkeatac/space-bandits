// Keep track of our socket connection
var socket;
var scoreBoard = "";
var name = "";
var input;
var button2;

//get window and div properties
var W = window.innerWidth;
var H = window.innerHeight;
//var canvasDiv = document.getElementById('sketch-holder');
//var divWidth = canvasDiv.offsetWidth;
//var divHeight = canvasDiv.offsetHeight;

// Keep all cursors' properties
var mouseArray = [];

//local shape variable -- contains color and coordinate variables
var shape = {
    "x": 100,
    "y": 100,
    "w": 40,
    "h": 40,
    "type": 0
};

// variable to create the creation animation
newShape = 30;

// a multiplier for aura variable
var aura_k = 0;
var incdec = +0.5;

var star_coordinates = [];


// Pre load the cursor image -- mandatory
function preload() {
    //cursor = loadImage('assets/cursor.png');
    cursor2 = loadImage('assets/cursor2.png');
    pla1 = loadImage('assets/pla1.png');
    pla2 = loadImage('assets/pla2.png');
    star_png = loadImage('assets/star.png');
    bg = loadImage('assets/bg.jpg');
    al1on = loadImage('assets/ship1on.png');
    al1off = loadImage('assets/ship1off.png');
    al2on = loadImage('assets/ship2on.png');
    al2off = loadImage('assets/ship2off.png');
    al3on = loadImage('assets/ship3on.png');
    al3off = loadImage('assets/ship3off.png');
    al4on = loadImage('assets/ship4on.png');
    al4off = loadImage('assets/ship4off.png');
    tel = loadImage('assets/tel.png');
    pink_noise = loadSound('assets/pink_noise.mp3');
    beep = loadSound('assets/beep.mp3');
}

// The set up function -- mandatory
function setup() {
    //Create a canvas that fills the div
    var canvas = createCanvas(W * 10.5 / 12, H + 5);
    canvas.parent('sketch-holder');
    ctx = canvas.drawingContext;

    pink_noise.setVolume(0.5);
    pink_noise.loop();
    beep.setVolume(0.3);
    beep.loop();
    noCursor();

    // Start a socket connection to the server
    socket = io.connect(window.location.hostname); // -- for heroku application
    //socket = io.connect('localhost:3000'); // -- for local development

    //create an input field and button for name submit
    input = createInput('').position(W / 2, H / 2 - 30 + 100);
    input.attribute("autofocus", '');
    button2 = createButton('submit name').position(W / 2 + 30, H / 2 + 100);
    button2.mousePressed(submitName);

    socket.on('mouse',
        // When we receive data
        function(data) {
            console.log("Got: " + data.x + " " + data.y);

            //if an object with same id exists update its coordinates
            var done = false;
            for (var i = 0; i < mouseArray.length; i++) {
                //var object = mouseArray[i];
                if (mouseArray[i].un == data.un) {
                    mouseArray[i].x = data.x;
                    mouseArray[i].y = data.y;
                    done = true;
                }
            }

            //if not exists push the object into the array
            if (done == false) {
                mouseArray.push(data);
            }

        }
    );

    socket.on('shape',
        function(data) {
            //set local shape to data received

            //if it is actually a new shape not just an info update
            if(shape.x != data.x){
              newShape = 0;
            }
            shape = data;
        }
    );

    socket.on('score',
        function(data) {
            //set local variable to scores received
            scoreBoard = data.score;
            var boardDiv = select('#scores');
            boardDiv.html(scoreBoard);
        }
    );

    socket.on('disconnectedUser',
        function(data) {
          //on user disconnecting, delete him from the array
            for (var i = 0; i < mouseArray.length; i++) {
                if (mouseArray[i].un == data.name) {
                    mouseArray.splice(i, 1);
                }
            }
        }
    );

    noStroke();
}


//telescope starting coordinates
var telx=-100;
var tely=-100;

//draw function -- mandatory
function draw() {
    image(bg,-3,-3,width,height);

    drawPlanet();

    drawTelescope();

    drawOtherShips();

    drawUserShip();

    if (name == "") {
        blurScreen();
    }
}

//function that blurs the screen and writes the guide at the beginning
function blurScreen() {
  fill(100, 100, 100, 200);
  rect(0, 0, W, H);

  imageMode(CENTER);
  fill(255);
  textSize(60);
  text("SPACE BANDITS", 360, 100 + 100);
  textSize(40);
  textFont("Helvetica");
  text("Get the most points by destroying the planets.", 208, 200 + 100);
  text("Control your spaceship by moving your mouse!", 200, 250 + 100);
  imageMode(CORNER);
}

//function that draws the planets according to data from server
function drawPlanet() {
  imageMode(CENTER);
  var aaa = map(shape.w, 60, 100, 50, 175); //CHANGE THE OPACITY AS THE PLANET GETS SMALLER
  tint(aaa);

  if (shape.type == 0){
    image(pla1, shape.x, shape.y, shape.w, shape.h);
  }
  else if (shape.type == 1){
    image(pla2, shape.x, shape.y, shape.w, shape.h);
  }

  noTint();
  imageMode(CORNER);
}

function drawOtherShips() {
  //DRAW OTHER USERS' SHIPS
  for (var i = 0; i < mouseArray.length; i++) {
      var data = mouseArray[i];
      if (data.x < shape.x + shape.w / 2 && data.x > shape.x - shape.w / 2 && data.y < shape.y + shape.h / 2 && data.y > shape.y - shape.h / 2) {
        imageMode(CENTER);
        if(data.type == 0){
          image(al1on,data.x,data.y,84/2,100/2);

        }
        else if (data.type == 1){
          image(al2on,data.x,data.y,84/2,100/2);

        }
        else if (data.type == 2){
          image(al3on,data.x,data.y,84/2,100/2);

        }
        else if (data.type == 3){
          image(al4on,data.x,data.y,84/2,100/2);

        }
        imageMode(CORNER);
      }
      else {
        imageMode(CENTER);
        if(data.type == 0){
          image(al1off,data.x,data.y,84/2,35/2);
        }
        else if (data.type == 1){
          image(al2off,data.x,data.y,84/2,35/2);

        }
        else if (data.type == 2){
          image(al3off,data.x,data.y,84/2,35/2);

        }
        else if (data.type == 3){
          image(al4off,data.x,data.y,84/2,35/2);

        }
        imageMode(CORNER);
      }
      fill(255,255,255);
      textSize(12);
      text(data.un, data.x + 20, data.y + 20);
  }
}

function drawUserShip() {
  //DRAW USER'S SHIP ACCORDINGLY TO ITS POSITION
  if (mouseX < shape.x + shape.w / 2 && mouseX > shape.x - shape.w / 2 && mouseY < shape.y + shape.h / 2 && mouseY > shape.y - shape.h / 2) {
    imageMode(CENTER);
    image(al1on,mouseX,mouseY,84/2,100/2);
    imageMode(CORNER);
  }
  else {
    imageMode(CENTER);
    image(al1off,mouseX,mouseY,84/2,35/2);
    imageMode(CORNER);
  }
}

//on user submitting name, set it and remove the input elements
function submitName() {
    name = input.value();
    if (name != "") {
        var nameJ = {
            "name": name
        }
        input.remove();
        button2.remove();
        socket.emit('username', nameJ);
    }
}

// Function for sending mouse data to the server
function sendmouse(xpos, ypos) {
    // Make a little object with x and y
    var data = {
        x: xpos,
        y: ypos
    };

    // Send that object to the socket
    socket.emit('mouse', data);
}

//send mouse data every X milliseconds
setInterval(function() {
    sendmouse(mouseX, mouseY);
}, 50);

function drawTelescope() {
  telx=random(0,1) + telx;
  tely=random(0,1) + tely;
  if(telx > 1000 || tely > 1000) {
    telx = -100;
    tely= -100;
  }
  push();
   rotate(radians(telx));
   image(tel,telx,tely);
  pop();
}

function keyPressed() {
    if (keyCode === ENTER) {
        if (name == "") {
            submitName();
        }
    }
}

function playsound(soundtrack)
{
  if(soundtrack.isPlaying() == false)
  {
    soundtrack.play();
  }
}

function stopsound(soundtrack)
{
  if(soundtrack.isPlaying() == true)
  {
    soundtrack.pause();
  }
}
