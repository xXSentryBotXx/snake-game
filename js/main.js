function SnakeGame () {
  let controllers = {};

  function gamepadHandler(event, connecting) {
    const gamepad = event.gamepad;
  
    if (connecting) {
      controllers[gamepad.index] = gamepad;
      gp = controllers[gamepad.index];
    } else {
      delete controllers[gamepad.index];
    }
  }

  function scangamepads() {
    let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        if (gamepads[i].index in controllers) {
          controllers[gamepads[i].index] = gamepads[i];
        } 
      }
    }
  }

  window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
  window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);

  const { GAME, PLAYER, FOOD, COMPONENT_TYPE } = CONSTANTS;

  let state;

  const canvas = document.getElementById('root');
  const ctx = canvas.getContext('2d');

  function init() {
    state = {
      player: {
        x: PLAYER.PLAYER_INIT_X,
        y: PLAYER.PLAYER_INIT_Y,
        prevX: PLAYER.PLAYER_INIT_X,
        prevY: PLAYER.PLAYER_INIT_Y,
        dx: 0,
        dy: 0,
        width: PLAYER.PLAYER_SIZE,
        height: PLAYER.PLAYER_SIZE,
        isAlive: true,
        playerMovement: 10,
        colorAngle: 0,
        color: '',
        tail: []
      },
      game: {
        width: GAME.GAME_WIDTH,
        height: GAME.GAME_HEIGHT,
        speed: GAME.GAME_SPEED,
        time: 0,
      },
      food: {
        x:  ( Math.floor(Math.random() * 800/10) ) * 10,
        y:  ( Math.floor(Math.random() * 600/10) ) * 10,
        color: generateColor(0),
        width: FOOD.FOOD_SIZE,
        height: FOOD.FOOD_SIZE,
        colorAngle: 0,
      },
      walls: [
        {
          x:  GAME.GAME_WIDTH / 2 - 10,
          y:  0,
          color: 'rgb(200, 200, 200)',
          width: FOOD.FOOD_SIZE * 3,
          height: GAME.GAME_HEIGHT,
        },
        {
          x:  0,
          y:  0,
          color: 'rgb(200,200,200)',
          width:  GAME.GAME_WIDTH,
          height: FOOD.FOOD_SIZE,
        },
        {
          x:  0,
          y:  0,
          color: 'rgb(200,200,200)',
          width: FOOD.FOOD_SIZE, 
          height: GAME.GAME_HEIGHT,
        },
        {
          x:  0,
          y:  GAME.GAME_HEIGHT - FOOD.FOOD_SIZE,
          color: 'rgb(200,200,200)',
          width:  GAME.GAME_WIDTH,
          height: FOOD.FOOD_SIZE,
        },
        {
          x:  GAME.GAME_WIDTH - FOOD.FOOD_SIZE,
          y:  0,
          color: 'rgb(200,200,200)',
          width:  FOOD.FOOD_SIZE,
          height: GAME.GAME_HEIGHT,
        },
      ],
      teleports: [
        [
          {
            id: 0,
            x:  0,
            y:  GAME.GAME_HEIGHT / 2,
            spawnX: 10,
            spawnY: GAME.GAME_HEIGHT / 2,
            color: '#342289',
            width:  FOOD.FOOD_SIZE,
            height: FOOD.FOOD_SIZE * 3,
            direction: 'right'
          },
          {
            id: 0,
            x:  GAME.GAME_WIDTH - 10,
            y:  GAME.GAME_HEIGHT / 2,
            spawnX: GAME.GAME_WIDTH - 20,
            spawnY: GAME.GAME_HEIGHT / 2,
            color: '#342289',
            width:  FOOD.FOOD_SIZE,
            height: FOOD.FOOD_SIZE * 3,
            direction: 'left'
          }
        ],
        [
          {
            id: 0,
            x:  GAME.GAME_WIDTH / 4,
            y:  0,
            spawnX: GAME.GAME_WIDTH / 4,
            spawnY: 10,
            color: 'darkgreen',
            width:  FOOD.FOOD_SIZE * 3,
            height: FOOD.FOOD_SIZE,
            direction: 'down'
          },
          {
            id: 0,
            x:  GAME.GAME_WIDTH * 3 / 4,
            y:  GAME.GAME_HEIGHT - 10,
            spawnX: GAME.GAME_WIDTH * 3 / 4,
            spawnY: GAME.GAME_HEIGHT - 20,
            color: 'darkgreen',
            width:  FOOD.FOOD_SIZE * 3,
            height: FOOD.FOOD_SIZE,
            direction: 'up'
          }
        ],
        [
          {
            id: 0,
            x:  GAME.GAME_WIDTH / 4,
            y:  GAME.GAME_HEIGHT - 10,
            spawnX: GAME.GAME_WIDTH / 4,
            spawnY: GAME.GAME_HEIGHT - 20,
            color: 'brown',
            width:  FOOD.FOOD_SIZE * 3,
            height: FOOD.FOOD_SIZE,
            direction: 'up'
          },
          {
            id: 0,
            x:  GAME.GAME_WIDTH * 3 / 4,
            y:  0,
            spawnX: GAME.GAME_WIDTH * 3 / 4,
            spawnY: 10,
            color: 'brown',
            width:  FOOD.FOOD_SIZE * 3,
            height: FOOD.FOOD_SIZE,
            direction: 'down'
          }
        ]
      ]
    };
  }

  function updatepos(gp) {
    if (!gp) {
      return
    }
    if (buttonPressed(gp.buttons[9])) {
      console.log("pressed Start")
      init();
    }
    if (buttonPressed(gp.buttons[12])) {
      state.player.dx = 0;
      if(state.player.dy === 0) {
        state.player.dy = -10;
      }
    } 
    if (buttonPressed(gp.buttons[13])) {
      state.player.dx = 0;
      if(state.player.dy === 0) {
        state.player.dy = 10;
      }
    }
    if (buttonPressed(gp.buttons[15])) {
      if(state.player.dx === 0) {
        state.player.dx = 10;
      }
      state.player.dy = 0;
    }
    if (buttonPressed(gp.buttons[14])) {
      if(state.player.dx === 0) {
        state.player.dx = -10;
      }
      state.player.dy = 0;
    }
  }

  function buttonPressed(b) {
    if (typeof(b) == "object") {
      return b.pressed;
    }
    return b == 1.0;
  }

  window.addEventListener('keydown', function ({ key }) {
    switch(key) {
      case 'ArrowUp':
        state.player.dx = 0;
        if(state.player.dy === 0) {
          state.player.dy = -10;
        }
        break;
      case 'ArrowDown':
        state.player.dx = 0;
        if(state.player.dy === 0) {
          state.player.dy = 10;
        }
        break;
      case 'ArrowLeft':
        if(state.player.dx === 0) {
          state.player.dx = -10;
        }
        state.player.dy = 0;
        break;
      case 'ArrowRight':
        if(state.player.dx === 0) {
          state.player.dx = 10;
        }
        state.player.dy = 0;
        break;
      case ' ':
        init();
        break;
    }
  });

  function drawComponent (comp) {
    const { color, x, y, width, height } = comp;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }

  function updatePlayer (player, game) {
    let { x, y, dx, dy, colorAngle, width, height, prevX, prevY, tail } = player;
    prevX = x;
    prevY = y;
    x += dx;
    y += dy;
    if (x < 0 ) {
      x = game.width - width;
    }
    if (x >= game.width) {
      x = 0; 
    }
    if (y < 0 ) {
      y = game.height - height;
    }
    if (y >= game.height) {
      y = 0; 
    }

    tail = updateTail(tail, prevX, prevY);

    return {
      ...player,
      tail,
      x,
      y,
      prevX,
      prevY,
      dx,
      dy,
      color:  generateColor(colorAngle++),
      colorAngle,
    };
  }

  function updateTail (tail, playerPrevX, playerPrevY) {
    if (!tail.length) return tail;

    tail[0].prevX = tail[0].x;
    tail[0].prevY = tail[0].y;
    tail[0].x =  playerPrevX;
    tail[0].y = playerPrevY;

    tail.forEach((item, idx) => {
      if (idx === 0) return;

      const prev = idx - 1;
      tail[idx].prevX = tail[idx].x;
      tail[idx].prevY = tail[idx].y;
      tail[idx].x =  tail[prev].prevX;
      tail[idx].y = tail[prev].prevY;
    });
    
    return tail;
  }

  function updatePlayerColor (player) {
    let { colorAngle } = player;
    return {
      ...player,
      color: generateColor(colorAngle++),
      colorAngle,
    }
  }

  function generateColor (angle) {
    return `hsl(${angle}, 100%, 50%)`;
  }

  function checkCollision (comp1, comp2) {
    if (comp1.x >= comp2.x && comp1.x + comp1.width <= comp2.x + comp2.width) { // horizontal boundaries
      if(comp1.y >= comp2.y && comp1.y + comp1.height <= comp2.y + comp2.height) { // vertical boundaries
        return true;
      }
    }
    return false;
  }

  function checkCollisionWithTail (player, comp) {
    const { tail } = player;

    for (let i = 0; i < tail.length; i++) {
      if (checkCollision(comp, tail[i])) return true;
    }

    return false;
  }

  function checkCollisionWithWalls (currState, comp) {
    const { walls } = currState;

    for (let i = 0; i < walls.length; i++) {
      if (checkCollision(comp, walls[i])) return true;
    }

    return false;
  }

  function checkCollisionWithTeleport (currState, comp) {
    const { teleports } = currState;

    for (let i = 0; i < teleports.length; i++) {
      for (let j = 0; j < teleports[i].length; j++) {
        if (checkCollision(comp, teleports[i][j])) return [i, j];
      }
    }

    return false;
  }

  function updateFood (currentState) {
    const { player, food } = currentState;

    if (player.tail.length > 0) {
      food.x = player.tail[player.tail.length - 1].x;
      food.y = player.tail[player.tail.length - 1].y;
      food.prevX = player.tail[player.tail.length - 1].x;
      food.prevy = player.tail[player.tail.length - 1].y;
    } else {
      food.x = player.x;
      food.y = player.y;
      food.prevX = player.x;
      food.prevy = player.y;
    }

    player.tail.push(food);

    return {
      ...currentState,
      player,
      food: generateNewFood(food.colorAngle + 10)
    };
  }

  function generateNewFood (colorAngle) {
    let newFood = {
      x:  ( Math.floor(Math.random() * 800/10) ) * 10,
      y:  ( Math.floor(Math.random() * 600/10) ) * 10,
      color: generateColor(colorAngle),
      width: FOOD.FOOD_SIZE,
      height: FOOD.FOOD_SIZE,
      colorAngle
    };
    while (collisionWithAny(state, newFood)) {
      newFood = {
        x:  ( Math.floor(Math.random() * 800/10) ) * 10,
        y:  ( Math.floor(Math.random() * 600/10) ) * 10,
        color: generateColor(colorAngle),
        width: FOOD.FOOD_SIZE,
        height: FOOD.FOOD_SIZE,
        colorAngle
      };
    }
    return newFood;
  }

  function collisionWithAny (currentState, newFood) {
    if (checkCollisionWithTail(currentState.player, newFood) || 
        checkCollisionWithWalls(currentState, newFood) ||
        checkCollisionWithTeleport(currentState, newFood)
    ) return true;;
    return false;
  }

  function handleTeleport(tpData, currentState) {
    let { teleports, player } = currentState;
    const [ i, j ] = tpData;

    const destination = teleports[i][Number(!j)];

    player.x = destination.spawnX;
    player.y = destination.spawnY;

    player = handleDirection(player, destination);
    
    return player;
  }

  function handleDirection (player, destination) {
    const { direction } = destination;

    switch(direction) {
      case 'left':
        player.dx = -10;
        player.dy = 0;
        break;
      case 'right':
        player.dx = 10;
        player.dy = 0;
        break;
      case 'up':
        player.dx = 0;
        player.dy = -10;
        break;
      case 'down':
        player.dx = 0;
        player.dy = 10;
        break;
    }

    return player;
  }

  function draw (currState, playerUpdated) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!playerUpdated) {
      currState.player = updatePlayerColor(currState.player);
    }
    currState.player.tail.forEach(item => {
      drawComponent(item);
    });
    currState.walls.forEach(wall => {
      drawComponent(wall);
    });
    currState.teleports.forEach(tpPair => {
      tpPair.forEach(tp => {
          drawComponent(tp);
        }
      );
    });
    drawComponent(currState.food);
    drawComponent(currState.player);
  }

  let gamepadStart = 0;
  function animate (timestamp) {
    let { game, player, food } = state;
    let { start, speed } = game;

    if (!start) state.game.start = timestamp;
    
    const progress = timestamp - start;
    const gpProgress = timestamp - gamepadStart

    if (gpProgress > speed/2) {
      scangamepads()
      const connectedGamepadIndices = Object.getOwnPropertyNames(controllers);
      if (connectedGamepadIndices.length > 0) {
       connectedGamepadIndices.forEach(key => {
          updatepos(controllers[key]);
        })
      }
      gamepadStart = timestamp;
    }

    if (progress > speed) {
      if (state.player.isAlive) {
        state.player = updatePlayer(player, game);
        state.game.start = timestamp;
        const tpCollision = checkCollisionWithTeleport(state, state.player);
        if (tpCollision) {
          state.player = handleTeleport(tpCollision, state);
        }
        if (checkCollisionWithTail(state.player, state.player) || 
            checkCollisionWithWalls(state, state.player)
        ) state.player.isAlive = false;
        
        if (checkCollision(state.player, food)) { // collision with food
          state = updateFood(state);
        }
      }
    }

    draw(state, progress > speed);
    requestAnimationFrame(animate);
  }

  init();
  animate(0);
}

SnakeGame();