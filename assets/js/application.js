---
---

var game = new Phaser.Game(window.innerWidth, window.innerHeight - 20, Phaser.AUTO, 'game', { preload:preload, create: create, update:update});
var activeGameTime = 0;
var end = false;

function preload(){
    device = game.device.desktop ? 'desktop' : 'mobile';
    game.load.image('sky', '{{ site.baseurl }}/assets/images/sky.png');
    game.load.image('background', '{{ site.baseurl }}/assets/images/' + device + '/background.png');
    game.load.image('santa', '{{ site.baseurl }}/assets/images/' + device + '/santa-sleigh.png');
    game.load.image('bounds', '{{ site.baseurl }}/assets/images/1px.png');
    if(device === 'desktop') {
        game.load.spritesheet('gift', '{{ site.baseurl }}/assets/images/' + device + '/gifts.png', 50, 80, 8);
    }
    else {
        game.load.spritesheet('gift', '{{ site.baseurl }}/assets/images/' + device + '/gifts.png', 30, 48, 8);
    }
    //autoalign the game stage
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);
    preloadAudio();
}

function preloadAudio() {
    game.load.audio('jingle', '{{ site.baseurl }}/assets/audio/jingle-bells.mp3');
    game.load.audio('santa', '{{ site.baseurl }}/assets/audio/santa.mp3');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    attachInputEvents();
    createBackground();
    createBounds();
    createSanta();
    createGifts();
    addScore();
    addAudio();
}

function addScore() {
    var imagePosX = (0.90 * game.world.width),
        imagePosY = (0.07 * game.world.height),
        textPosX = imagePosX + (0.01 * game.world.width),
        textPosY = imagePosY - (0.005 * game.world.height);
        image = game.add.sprite(imagePosX, imagePosY, 'gift');
    image.scale.set(0.5, 0.5);
    image.anchor.set(0.9);
    scoreText = game.add.text(textPosX, textPosY - (0.04 * game.world.height), '0', {
        font: '22px Helvetica',
        fill: '#fff'
    });
}

function addAudio() {
    game.audio = {};
    var jingle = game.add.audio('jingle', 0.05, true);
    jingle.play();
    game.audio.santaLaugh = game.add.audio('santa', 0.05);
    game.audio.santaLaugh.addMarker('santa-laugh', 1, 10.9);
}

function attachInputEvents() {
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    game.input.onDown.add(jump, this);
}

function createBounds() {
    platforms = game.add.group();
    platforms.enableBody = true;
    var heights = [0, game.world.height - 1];
    for (var i = 0; i < heights.length; i++) {
        for (var index = 0; index < game.world.width; index++) {
            ground = platforms.create(index, heights[i], 'bounds');
            game.physics.arcade.enable(ground);
            ground.body.immovable=true;
        }
    }
}

function createBackground() {
    var sky = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'sky');
    var background_height = (device === 'desktop') ? 306 : 152;
    background = game.add.tileSprite(0, (game.world.height - background_height), game.world.width, game.world.height, 'background');
}

function createSanta() {
    santa = game.add.sprite((game.world.width/20), (game.world.height/10), 'santa');
    game.physics.arcade.enable(santa);
    santa.body.gravity.y = 400;
    santa.body.collideWorldBounds = true;
}

function createGifts() {
    gifts = game.add.group();
    gifts.enableBody = true;
    gifts.setAll('checkWorldBounds', true);
    gifts.setAll('outOfBoundsKill', true);
}

function createGift() {
    var posX = game.rnd.integerInRange((game.world.width*0.1), game.world.width);
        gift = gifts.create(posX, game.world.randomY, 'gift'),
        giftIndex = game.rnd.integerInRange(0, 7);
    gift.loadTexture('gift', giftIndex);
    game.physics.arcade.enable(gift);
    gift.body.bounce.y = randomBounce();
    gift.body.velocity.x = -100;
    gift.alpha = 0.5;
    game.add.tween(gift).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function randomBounce() {
    return 0.7 + Math.random() * 0.2;
}

function associatedInteractions() {
    game.physics.arcade.overlap(santa, gifts, collectGift, null, this);
    game.physics.arcade.overlap(santa, platforms, endGame, null, this);
}

function endGame() {
    end = true;
    gifts.destroy();
    gameOver();
}

function collectGift(santa, gift) {
    game.audio.santaLaugh.play('santa-laugh');
    gift.kill();
    updateScore();
    if ("vibrate" in navigator) {
        navigator.vibrate(200);
    }
}

function updateScore() {
    scoreText.text = gifts.countDead();
}

function animateSanta() {
    if(santa.angle > 0) {
        santa.angle = -5;
    }
    else {
        santa.angle = 5;
    }
}

function jump(velocity) {
    santa.body.velocity.y = -200;
}

function update() {
   if(!end) {
        var upKeyPressed = upKey.isDown;
        background.tilePosition.x -= 2;
        if (game.time.now > activeGameTime) {
            createGift();
            animateSanta();
            activeGameTime = game.time.now + 2000;
        }
        associatedInteractions();
        upKeyPressed && jump();
    }
}

function gameOver() {
    var txtStyle = {font: "50px Arial", fill: "red", stroke: '#000000', strokeThickness: 3},
        txt = this.game.add.text(game.camera.width / 2, game.camera.height / 2, "Game Over", txtStyle);
    txt.anchor.setTo(0.5, 0.5);
    txt.fixedToCamera = true;
}