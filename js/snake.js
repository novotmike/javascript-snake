 var COLUMNS = 20;
  var ROWS  = 20;
  var EMPTY = 0;
  var SNAKE   = 1;
  var FOOD  = 2;

  var LEFT  = 0;
  var UP    = 1;
  var RIGHT = 2;
  var DOWN  = 3;
  //GAMESTATES
  var PAUSE = false;
  var START = true;
  var NOTSUPORTED = false;
  //keycodes:
  var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40;
  var KEY_SPACE = 32, KEY_EASY = 0;

  var grid = {
    width: null,
    height: null,
    _grid: null,

    init: function(d, col, row) {
      this.width  = col;
      this.height = row;

      this._grid = [];
      for (var i = 0; i < col; i++) {
        this._grid.push([]);
        for (var j = 0; j < row; j++) {
          this._grid[i].push(d);
        }
      }
    },

    set: function(val, x, y) {
      this._grid[x][y] = val;
    },

    get: function(x, y) {
      if(x < 0 || x > COLUMNS-1) {
        return EMPTY;
      }else {
        return this._grid[x][y];
      }
    }
  }

  var snake = {
    direction: null,
    last: null, 
    _queue: null,

    init: function(d, x, y) {
      this.direction = d;

      this._queue = [];
      this.insert(x,y);

    },

    insert: function(x, y) {
      this._queue.unshift({x:x, y:y});
      this.last = this._queue[0];
    },

    remove: function() {
      return this._queue.pop();
    }
  }

  function setFood() {
    var empty = [];

    for (var x = 0; x < grid.width; x++) {
      for (var y = 0; y < grid.height; y++) {
          if(grid.get(x,y) === EMPTY) {
            empty.push({x:x, y:y});
          }
      }
    }

    var randomPosition = empty[Math.floor(Math.random()*empty.length)];
    grid.set(FOOD, randomPosition.x, randomPosition.y);

  }

  //GAME OBJECTS
  var canvas, ctx, keystate, frames, score, dir, dirVal;


  function main() {
    var div = document.createElement('main');
    canvas = document.createElement("canvas");
    canvas.width  = COLUMNS*20;
    canvas.height   = ROWS*20
    ctx = canvas.getContext("2d");
    div.appendChild(canvas);

    document.body.appendChild(div);

    ctx.font = "12px Tahoma";

    frames = 0;
    keystate = {};

    document.addEventListener("keydown", function(evt) {
      keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function(evt) {
      delete keystate[evt.keyCode];
    });

    //SNAKE Accelerometer
    function process(){
      var tmp="";
      var val=0;

      var absX = Math.abs(x);
      var absY = Math.abs(y);

      if(x<0){
        if(y<0){
          if(absX>absY){
            tmp="left";
            val=absX;
          }else{
            tmp="up";
            val=absY;
          }
        }else{
          if(absX>absY){
            tmp="left";
            val=absX;
          }else{
            tmp="down";
            val=absY;
          }
        }
      }else{
        if(y<0){
          if(absX>absY){
            tmp="right";
            val=absX;
          }else{
            tmp="up";
            val=absY;
          }
        }else{
          if(absX>absY){
            tmp="right";
            val=absX;
          }else{
            tmp="down";
            val=absY;
          }
        }
      }
      if(val>sensitivity){
        dir=tmp;
      } else {
        dir="----";               
      }
      //document.getElementById("header1").innerHTML = dir;

      if(dir === "up") {
        keystate[KEY_UP] = true;
        delete keystate[KEY_RIGHT];
        delete keystate[KEY_DOWN];
        delete keystate[KEY_LEFT];
      }else if(dir === "down") {
        keystate[KEY_DOWN] = true;
        delete keystate[KEY_RIGHT];
        delete keystate[KEY_UP];
        delete keystate[KEY_LEFT];
      }else if(dir === "left") {
        keystate[KEY_LEFT] = true;
        delete keystate[KEY_RIGHT];
        delete keystate[KEY_DOWN];
        delete keystate[KEY_UP];
      }else if(dir === "right") {
        keystate[KEY_RIGHT] = true;
        delete keystate[KEY_DOWN];
        delete keystate[KEY_UP];
        delete keystate[KEY_LEFT];
      }
    }

    var x = NaN;
    var y = NaN;
    battery = NaN;
    var dir = "----";
    var dirVal = 0; 
    var sensitivity = 0.25; 

    if ("WebSocket" in window) {
      var ws1 = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000001/events?topic=89%2F20202002%2FaccX");                  
      var ws2 = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000001/events?topic=89%2F20202002%2FaccY");                    
      var ws3 = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000001/events?topic=89%2F20202002%2Fvbat");   
      var ws4 = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000001/events?topic=124%2FFFFFF0000E6D%2Fbutton");
      ws1.onmessage = function (evt) { 
        x = JSON.parse(evt.data).data;  
        process();                  
      }; 

      ws2.onmessage = function (evt) {                  
        y = JSON.parse(evt.data).data;    
        process();                  
      };    

      ws3.onmessage = function (evt) {
        battery = JSON.parse(evt.data).data; 
        battery=((battery-3200)/16.8).toFixed(1)+"%";
      } 

      ws4.onmessage = function(evt) {
        var dt = JSON.parse(evt.data).data;
        if(dt === 'PRESSED') {
          keystate[KEY_EASY] = true;
        }else if(dt === 'RELEASED') {
          keystate[KEY_EASY] = false;
        }
      }
    }else {
      NOTSUPORTED = true;
    }

    init();

    loop();
  }


  function init() {
    START = true;
    PAUSE = false;
    score = 0;
    grid.init(EMPTY, COLUMNS, ROWS);
    var sp = {x:Math.floor(COLUMNS/2), y:ROWS-1}
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);

    setFood();
  }


  function loop() {
    if(keystate[KEY_SPACE] || keystate[KEY_EASY]) {
      if(START !== true)
        PAUSE = !PAUSE;

      START = false;
      delete keystate[KEY_SPACE];
      delete keystate[KEY_EASY];
    }

    if(!PAUSE && !START) {
      update();
      dir = "----";
      dirVal = 0;
    }
    //Check for food
    var isFood = false;
    for (var x = 0; x < grid.width; x++) {
      for (var y = 0; y < grid.height; y++) {
        if(grid.get(x, y) === FOOD) {
          isFood = true;
        }
      }
    }
    if(!isFood) {
      setFood();
    }

    draw();

    window.requestAnimationFrame(loop, canvas);
  }

  function update() {
    frames++;

    if(keystate[KEY_LEFT] && snake.direction !== RIGHT) {
      snake.direction = LEFT;
    }
    if(keystate[KEY_UP] && snake.direction !== DOWN) {
      snake.direction = UP;
    }
    if(keystate[KEY_RIGHT] && snake.direction !== LEFT) {
      snake.direction = RIGHT;
    }
    if(keystate[KEY_DOWN] && snake.direction !== UP) {
      snake.direction = DOWN;
    }

    if(frames%12 === 0) {
      var nx = snake.last.x;
      var ny = snake.last.y;

      switch(snake.direction) {
        case LEFT: 
          nx--;
          break;
        case UP:
          ny--;
          break;
        case RIGHT:
          nx++;
          break;
        case DOWN:
          ny++;
          break;
      }

      if(grid.get(nx, ny) === SNAKE) {
        return init();
      }

      //0 > nx || nx > grid.width-1 || 
        //0 > ny || ny > grid.height-1 ||

      if(grid.get(nx, ny) === FOOD) {
        var tail = {x:nx, y:ny};
        score++;
        setFood();
      }else {
        var tail = snake.remove();
        grid.set(EMPTY, tail.x, tail.y);

        if(ny < 0) {
          tail.x = nx;
          tail.y = ROWS;
        }else if(nx < 0) {
          tail.x = COLUMNS-1;
          tail.y = ny;
        }else if(ny > grid.height-1){
          tail.x = nx;
          tail.y = 0;
        }else if(nx > grid.width-1) {
          tail.x = 0;
          tail.y = ny;
        }else {
          tail.x = nx;
          tail.y = ny;
        }
      }
      grid.set(SNAKE, tail.x, tail.y);

      snake.insert(tail.x, tail.y);
    }
  }

  function draw() {
    var tw = canvas.width/grid.width;
    var th = canvas.height/grid.height;


    for (var x = 0; x < grid.width; x++) {
      for (var y = 0; y < grid.height; y++) {
        switch(grid.get(x, y)) {
          case EMPTY:
            ctx.fillStyle = "#fff";
            if((x%2 === 0 && y%2 === 0) || (x%2 === 1 && y%2 === 1)) {
              ctx.fillStyle = "#eee";
            }
            
            break;
          case SNAKE:
            ctx.fillStyle = "#00f";
            break;
          case FOOD:
            ctx.fillStyle = "#f00";
            break;
        }
        ctx.fillRect(x*tw, y*th, tw, th);
      }
    }
    ctx.fillStyle = "#000";
    ctx.fillText("SCORE: "+score, canvas.width-70, 15);
		
	ctx.fillStyle = "#000";
    ctx.fillText("BATTERY: "+battery, canvas.width-200, 15);


    if(PAUSE) {
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED! Press <space> to continue...", canvas.width/2, canvas.height/2);
    }
    if(START) {
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText("PRESS <space> to start the game!", canvas.width/2, canvas.height/2);
    }
    if(NOTSUPORTED) {
      ctx.fillStyle = "#f00";
      ctx.textAlign = "center";
      ctx.fillText("YOUR BROWSER DOES NOT SUPPORT WEBSOCKETS!", canvas.width/2, 15);
    }

  }
  main();
