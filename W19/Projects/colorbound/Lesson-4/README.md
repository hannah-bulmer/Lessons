## Meet-Up #4 Agenda:

**Objective**: Give the player some health and have the enemies fire rockets that explode and hurt the player.

## 1. Player Health
Having refactored the player code into a separate file, we don't have to worry about where we're going to put this code; it belongs in the player file of course!

So in the original game, the player has a maximum health as well as a current health value.
This very simple system can be represented by adding these two properties to the player object, so that's what we'll do:

```js
// player.js

let player = {
    // other properties
    
    maxHp: 5,
    hp: 5
};
```

Now we must display this to the user in some way. Since the maximum amount of hp is relatively limited (and more importantly, it's an integer), we'll use heart containers to display it:

![Alt text](hp_bar.png?raw=true "Health")

Recall from our very first lesson that we could draw images directly to the screen using `ctx.drawImage(image, x, y)`. That's exactly what we're going to do here. Let's create another function draw drawing the player health.

```js
// player.js

const HEART_IMAGE = loadImage("assets/heart.png");
const EMPTY_HEART_IMAGE = loadImage("assets/empty_heart.png");

const HEART_DRAW_OFFSET_X = 10;
const HEART_DRAW_OFFSET_Y = 10;

function drawPlayerHp() {
    for(let i = 0; i < player.maxHp; ++i) {
        const x = HEART_DRAW_OFFSET_X + i * HEART_IMAGE.width;
        const y = HEART_DRAW_OFFSET_Y;

        if(i > player.hp) {
            ctx.drawImage(EMPTY_HEART_IMAGE, x, y);
        } else {
            ctx.drawImage(HEART_IMAGE, x, y);
        }
    }
}
```

Now, we head back to `loop.js` and call this function after drawing the tilemap and the sprites:

```js
// loop.js

function draw() {
    // Other code
    drawPlayerHp();
}
```

Notice how we didn't pass in the camera position as a parameter. This is because the player HP display is always drawn in the same location on the screen regardless of where the camera is.

Now run the game. Ta-da! That's basically it. Open up the JavaScript console in your browser and mess with `player.health` (ex. set it to a value < maxHp) and see the display change.

## 2. Rockets
So right now enemies don't really do much other than chase the player and bounce off of each other. Let's get them to fire rockets at the player! 

Now although rockets are only going to be fired by enemies, they are a separate entity altogether from them, so we'll be placing all their code in a separate file.

```js
// rockets.js

// Since there are many rockets, we keep track of them with an array (much like enemies)
let rockets = [];
```
