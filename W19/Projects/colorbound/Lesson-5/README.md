# Meet-Up #5 Agenda

**Objective**: Allow the player to shoot enemies, have them fire rockets at the player (Exercise from previous lesson)

## Shooting Enemies

### Design
In the original game, the player's weapon is essentially a laser gun which shoots beams of 3 different colors. These can be shot to the left or right depending on which direction the player is facing.

Visually, each of these beams is actually just an image that's stretched horizontally until it reaches a certain length, at which point it stops expanding and the beam starts disappearing. Once they start disappearing, they cannot damage anything.

Mechanically, the color of the beam must match the color of the enemy in order to destroy them. Furthermore, the beam does not pierce through enemies or walls by default, but it's up to you how you want this to work.

In the original game, there were powerups that enabled this piercing behaviour, allowed the player to shoot down rockets, and increased the fire rate of the gun. These are all potential powerups you can implement in the future, but this lesson will not cover them.

That's basically it for the design of the beams. Remember, you're free to change any of this. Heck, get creative and make an entirely different weapon if you're so inclined. The point of this lesson and this project in general is to give you an idea of how you can go from an idea to a concrete playable game. What you make with this skillset is up to you.

### Implementation
At this point, we've implemented two types of entities other than the player; namely, enemies and rockets. At this point, you probably know the drill when we introduce a new entity:

```js
// lasers.js

let lasers = [];

// dir is -1 for left, 1 for right
function createLaser(x, y, dir, color) {
    let laser = {
        x: x,
        y: y,
        dir: dir,
        color: color,
        
        // Initially the length is 0 and it grows over time
        length: 0,

        // Once it exceeds the max length, it will start fading out. We will
        // use this to keep track of how much time is left before its completely
        // gone
        fadeTimer: 0
    };

    lasers.push(laser);
    
    return laser;
}

function removeLaser(laser) {
    let i = lasers.indexOf(laser);

    if(i < 0) {
        return;
    }
        
    lasers.splice(i, 1);
}
```

As you can see, there is basically a one-to-one mapping between the design and the implementation as far as the properties of the entity are concerned. The laser beam grows in length, hence the laser has a `length` property. It fades, hence the `fadeTimer`, and so on.

Sitting down and coming up with the design prior to implementing features can be pretty helpful at times. Certain features, of course, lend themselves to experimentation/prototyping, so try to keep the design minimal before you go ahead and implement things.

#### Basic Update and Draw

Let's implement a minimal laser update function which makes the laser length increase until it
reaches a maximum and then deletes it:

```js
// lasers.js

// I'm making this a constant, but you can make it a variable
// if you want to change it, for example, as a powerup
const LASER_MAX_LENGTH = 400;

// Just for testing purposes, the laser will grow at 200 pixels per second
const LASER_GROW_RATE = 200;

function updateLasers() {
    for(let i = 0; i < lasers.length; ++i) {
        let laser = lasers[i];
        
        // Recall that SEC_PER_FRAME is the fraction of a second
        // each frame takes; as such, multiplying by it produces
        // a value which has a unit "per second"
        laser.length += LASER_GROW_RATE * SEC_PER_FRAME;

        if(laser.length >= LASER_MAX_LENGTH) {
            removeLaser(laser);
        }        
    }
}
```

It's exactly what you'd expect. Drawing the laser proves to be a little more tricky though:

```js
// lasers.js

const LASER_IMAGES = {
    red: loadImage("assets/redwave.png"),
    blue: loadImage("assets/bluewave.png"),
    yellow: loadImage("assets/yellowwave.png")
};

function drawLasers(camera) {
    for(let i = 0; i < lasers.length; ++i) {
        let laser = lasers[i];

        // There is a version of drawImage which takes the following parameters:
        // drawImage(image, x, y, w, h)
        // where w and h designate the size of the resulting image (i.e. you can
        // use this to arbitrarily scale 2d images when drawing them).
        // However, neither w or h can be negative (it will draw nothing), so
        // we have to break apart the two directions here

        const image = LASER_IMAGES[laser.color];

        if(laser.dir < 0) {
            ctx.drawImage(image, 
                // The '- laser.length' the key difference between this drawImage and
                // the one in the else clause. Think about it visually.
                laser.x - laser.length - camera.x, 

                laser.y - camera.y, laser.length, image.height);
        } else {
            ctx.drawImage(image, laser.x - camera.x, laser.y - camera.y, laser.length, image.height);
        }
    }
}
```

Now let's incorporate it into our game loop:

```js
// loop.js

function update() {
    // Other code...

    updateLasers();
}

function draw() {
    // Other code...

    // Put this where the draw order makes sense (probably okay if the lasers
    // are behind the sprites)
    drawLasers(camera);
}
```

### Creating Lasers

Right now, we don't actually create lasers anywhere. We _could_ just make a bunch of lasers
in the game loop `init` function, but the lasers are very short lived. You could also create a laser every time the player jumps (just like we did with rockets to test them), and that's a good idea for testing.

However, it's difficult to tune something that the player has control over unless you directly hook it up to player input. So let's do that. We'll need to add new input handlers for shooting:

```js
// input.js

let input = {
    left: false,
    right: false,
    jump: false,

    shootRed: false,
    shootBlue: false,
    shootYellow: false
};

window.addEventListener("keydown", function(e) {
    // Other conditions

    if(e.key == "j") {
        input.shootRed = true;
    } else if(e.key == "k") {
        input.shootBlue = true;
    } else if(e.key == "l") {
        input.shootYellow = true;
    }
});

// Similar thing for the 'keyup' event handler (except setting the 
// variables to false).
```

I've decided to bind the three colors (red, blue, yellow) to `j, k, l` on the keyboard, but you can pick whatever keys you feel comfortable with (google javascript keycode info for a handy website that tells you the `key` value for non-character keys like the spacebar and arrow keys).

Now let's process this input. Clearly, the perfect place for this would be the `playerProcessInput` function:

```js
// player.js

// A little helper to create a laser at the player's position with a given color
function playerCreateLaser(color) {    
    // The '?' is a handy syntax which works as follows:
    // let v = x ? a : b;
    // =>
    // let v;
    // if(x) { v = a; } else { v = b; }

    const dir = player.sprite.flip ? -1 : 1;    

    // If the player is flipped, the muzzle of the gun will
    // be at a different location than when they're not flipped.
    // Either way, the location has some offset relative to the player
    // sprite position, so we store that here.

    let offX = 0;
    let offY = 0;

    if(dir < 0) {
        // I made up these values. Play with them; I highly recommend factoring these
        // out into variables and then messing with them in the console. Once you've got good
        // values, make them const.
        offX = 10;
        offY = 60;
    } else {
        offX = 100;
        offY = 60;
    }

    createLaser(player.sprite.x + offX, player.sprite.y + offY, dir, color);
}

function playerProcessInput() {
    // Other code...

    if(input.shootRed) {
        playerCreateLaser("red");
    } else if(input.shootBlue) {
        playerCreateLaser("blue");
    } else if(input.shootYellow) {
        playerCreateLaser("yellow");
    }
}
```

Now if you run the game, we should be able to fire lasers using `j, k, l` and see them grow and them disappear immediately.
