---
---

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload:preload, create: create, update:update});
var activeGameTime = 0;

function preload(){
    var device = game.device.desktop ? 'desktop' : 'mobile';
    game.load.image('background', '{{ site.baseurl }}/assets/images/' + device + '/background.png');
    game.load.image('santa', '{{ site.baseurl }}/assets/images/' + device + '/santa-sleigh.png');
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
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    attachInputEvents();
    createBackground();
    createSanta();
    createGifts();
    addAudio();
}

function addAudio() {
    game.audio = game.add.audio('jingle', 1, true);
    game.audio.play();
}

function attachInputEvents() {
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    game.input.onDown.add(jump, this);
}

function createBackground() {
    background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');
}

function createSanta() {
    santa = game.add.sprite((game.world.width/20), game.world.randomY, 'santa');
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
    gift.alpha = 0;
    game.add.tween(gift).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function randomBounce() {
    return 0.7 + Math.random() * 0.2;
}

function associatedInteractions() {
    game.physics.arcade.overlap(santa, gifts, collectGift, null, this);
}

function collectGift(santa, gift) {
    gift.kill();
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
    var upKeyPressed = upKey.isDown;

    background.tilePosition.x -= 2;
    // santa.body.velocity.y = 0;
       // Create Baddie after every 4 seconds
    if (game.time.now > activeGameTime) {
        createGift();
        animateSanta();
        activeGameTime = game.time.now + 2000;
    }
    associatedInteractions();
    upKeyPressed && jump();
}