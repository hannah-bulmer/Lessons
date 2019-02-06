let input = {
    left: false,
    right: false,
    jump: false
};

let canvas = document.getElementById("view");
let ctx = canvas.getContext("2d");

let playerImage = loadImage("assets/player.png");

let player = {
    sprite: createSprite({
        image: playerImage,

        frameWidth: 128,
        frameHeight: 128,

        anims: {
            run: {
                startFrame: 6,
                length: 7,
                frameTime: 0.08
            }
        }
    })
};

player.sprite.y = 200;

playAnim(player.sprite, "run");

window.addEventListener("keydown", function(e) {
    if(e.key == "a") {
        input.left = true;
    } else if(e.key == "d") {
        input.right = true;
    } else if(e.key == "w") {
        input.jump = true;
    }
});

window.addEventListener("keyup", function(e) {
    if(e.key == "a") {
        input.left = false;
    } else if(e.key == "d") {
        input.right = false;
    } else if(e.key == "w") {
        input.jump = false;
    }
});

function processInput() {
    if(input.left) {
        player.sprite.x -= 4;
        player.sprite.flip = true;
    } 
    
    if(input.right) {
        player.sprite.x += 4;
        player.sprite.flip = false;
    } else {
    }
}

function update() {
    updateSprites();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    let camera = {
        x: 0,
        y: 100
    };

    drawTilemap(camera);
    drawSprites(camera);
}

function loop() {
    if(areAllAssetsLoaded()) {
        processInput();
        update();
        draw();
    }

    requestAnimationFrame(loop);
}

loop();
