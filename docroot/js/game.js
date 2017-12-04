/**
 * Credits:
 *
 * https://openclipart.org/detail/188960/sombrero
 * https://openclipart.org/detail/174714/baby-crying
 * https://www.flickr.com/photos/gageskidmore/8567826396/in/photolist-e47mhL-R3TvDy-Qw9PJb-kNEv1p-e47iAy-3no3M-SVqQvK-iiTx6U-8aumex-9hKrkx-WJkBZQ-R7Nudo-xYGVQk-RryAat-R3TryE-8h5Vnw-b7sfkX-5ou5SH-R3TqqN-9hLx6s-8XUYZw-W6tw7D-7Uzmbx-qha67U-Q7jHqo-NjziWA-6Rnrkd-RfVKXD-ayVyao-4KgARR-aDUqFy-b7sfLi-RrAeoD-SA33si-WwVfZH-r6wTD8-KL1GFn-9okTfn-QS3ZCh-UTWjh5-Ro5qtJ-FonYCq-Rhurin-RhuTmz-WTzd4g-Rtf6S4-RpEMnJ-Rtef8K-RtfdT8-4ivy2Q
 * https://openclipart.org/detail/194012/hillary-clinton-colorized
 * https://freesound.org/people/DSISStudios/sounds/241000/
*/

var game = new Phaser.Game(1024, 768, Phaser.AUTO, '');

var baby;
var layer;

var planet_health = 3;
var score = 0;
var level = 1;
var music;


var text;
var last_tweet_score = 0;
var tweet_texts = [];
var trump_left;
var bad_guys;
var max_bad_guys = 3;
var creating_bad_guy = false;
var nuclear_button;

var tweets = [
  "Sad!",
  "Fake News!",
  "Little Rocket Man",
  "Tax cuts!",
  "#MAGA",
  "covfefe"
]


var bad_guy_types = [];

bad_guy_types.push({
  name: 'sombrero',
  image: 'sombrero',
  image_width: 64,
  image_height: 51,
  speed: 100 
});

bad_guy_types.push({
  name: 'clinton',
  image: 'clinton',
  image_width: 64,
  image_height: 80,
  speed: 120 
});

WebFontConfig = {
    google: {
      families: ['Six Caps']
    }

};

var loadState = {

  preload: function() {
		game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.atlasJSONHash('trump_left', 'assets/trump-left.png', 'assets/trump-left.json');
    game.load.atlasJSONHash('trump_right', 'assets/trump-right.png', 'assets/trump-right.json');
    for (i = 0; i < bad_guy_types.length; i++) {
        game.load.atlasJSONHash(bad_guy_types[i].name,
                                'assets/' + bad_guy_types[i].image + '.png',
                                'assets/' + bad_guy_types[i].image + '.json');

    }
    game.load.audio('boom', ['assets/boom.ogg']);
    game.load.audio('game', ['assets/joke_on_you.mp3']);

    game.load.tilemap('wall', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');

  },

  create: function() {
    game.state.start('menu');
  }

};

var menuState = {

  create: function() {

    text = game.add.text(game.world.centerX, game.world.centerY, "TRUMP'S TRUMP!\nSTOP THE MAN-CHILD FROM PRESSING THE NUCLEAR BUTTON\nPRESS TO DROP A DISTRACTION TO BRING HIM BACK TO HIS TOWER!\nTHE MORE DISTRACTIONS HE DESTROYS, THE FASTER HE GETS!\nPress 'S' to start");
    text.anchor.setTo(0.5);

    text.font = 'Six Caps';
    text.fontSize = 60;

    //  x0, y0 - x1, y1
    grd = text.context.createLinearGradient(0, 0, 0, text.canvas.height);
    grd.addColorStop(0, '#FFA500');   
    grd.addColorStop(1, '#FFFF00');
    text.fill = grd;

    text.align = 'center';
    text.stroke = '#000000';
    text.strokeThickness = 2;
		text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

    var skey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    skey.onDown.addOnce(this.start, this);

    },

    start: function() {
      game.state.start('play');
    },

};

var playState = {

  update: function() {
    score = score + 1;
    game.physics.arcade.overlap(baby, bad_guys, this.hit_bad_guy, null, this);
    game.physics.arcade.collide(baby, layer);
    game.physics.arcade.collide(bad_guys, layer);

    if (last_tweet_score && ((score - last_tweet_score) > (100))) {
      for (var i = 0; i < tweet_texts.length; i++) {
        tweet_texts[i].visible = false;
      }
      last_tweet_score = 0;
    }

    if (baby.left > (7775)) {
      music.stop();
    game.sound.play('boom');
    game.sound.play('boom');
    game.sound.play('boom');
      game.state.start('end');
    }
    
    if (creating_bad_guy) {
      if (game.input.activePointer.isUp) {
        creating_bad_guy = false;
      }
    }

    if (!creating_bad_guy && bad_guys.countLiving() < max_bad_guys) {
      if (game.input.activePointer.isDown && baby.left > (40*16)) {
        creating_bad_guy = true;
        this.drop_new_bad_guy();
      }
    }

    if (bad_guys.countLiving()) {
      bad_guy_left = 0;
      for (var i = 0; i < bad_guys.children.length; i++) {
        if (bad_guys.children[i].visible) {
          bad_guy_left = bad_guys.children[i].left;
          break;
        }
      }
      distance = Math.abs(bad_guy_left - baby.left);
      if (bad_guy_left < baby.left) {
        if (baby.body.velocity.x > 0 && distance > 50) {
          baby.body.velocity.x = 0 - Math.abs(baby.body.velocity.x);
        }
      }
      else {
        if (baby.body.velocity.x < 0 && distance > 50) {
          baby.body.velocity.x = Math.abs(baby.body.velocity.x);
        }
      }
    }

    message = "Child is " + (100 - Math.floor((baby.position.x / game.world.width) * 100)) + "% away from the nuclear button\nThere are " + bad_guys.countLiving() + "/3 active distractions\nScore: " + score;
    text.setText(message);
  },

  create: function () {
    text = game.add.text(10, 0, "", {
      font: "40px Six Caps",
      fill: "#ffa500",
      align: "left"
    });
    text.fixedToCamera = true;

    music = new Phaser.Sound(game,'game',0.75,true);
    music.play();

game.physics.startSystem(Phaser.Physics.ARCADE);
game.stage.backgroundColor = '#0000ee';
map = game.add.tilemap('wall');

map.addTilesetImage('simples_pimples', 'tiles');

map.setCollisionBetween(0,24000);

layer = map.createLayer('Tile Layer 1');

layer.resizeWorld();

baby = game.add.sprite(96, 171, 'trump_right');
baby.animations.add('animate');
baby.animations.play('animate', 12, true);

game.physics.arcade.gravity.y = 250;

game.physics.enable(baby);
baby.body.bounce.y = 0.2;
baby.body.velocity.x = 200;
baby.body.linearDamping = 1;
baby.body.collideWorldBounds = true;

game.camera.follow(baby);

cursors = game.input.keyboard.createCursorKeys();

bad_guys = game.add.group();
bad_guys.enableBody = true;

},

  hit_bad_guy: function(player, bad_guy) {
    tweet_index = Math.floor((Math.random() * tweets.length));
    tweet_texts.push(game.add.text(player.position.x, player.position.y, tweets[tweet_index], { border: "6px solid black", font: "24px Arial", fill: "#0000aa", align: "center", backgroundColor: "#ffffff" }));
    last_tweet_score = score;
    bad_guy.kill();
    baby.body.velocity.x = Math.abs(baby.body.velocity.x * 1.3);

    game.sound.play('boom');
  },

  drop_new_bad_guy: function() {
    new_bad_guy_index = Math.floor((Math.random() * bad_guy_types.length) + 1);

    bad_guy_type = bad_guy_types[new_bad_guy_index-1]
    start_x = (0 - game.world.position.x) + 100;
    start_y = 0;
    var new_bad_guy = bad_guys.create(start_x, start_y, bad_guy_type.name);
    var animate = new_bad_guy.animations.add('animate');
    new_bad_guy.animations.play('animate', 8, true);
    game.physics.enable(new_bad_guy);
    new_bad_guy.body.velocity.y = 200;
    speed = bad_guy_type.speed;
    if (start_x > 50 && Math.random() > 0.5) {
      speed = (0 - speed);
    }

    new_bad_guy.body.velocity.x = speed;
    new_bad_guy.body.bounce.y = 0.1;
    new_bad_guy.body.linearDamping = 1;
    new_bad_guy.body.collideWorldBounds = true;
  },

};

var endState = {

  create: function() {

    game.stage.backgroundColor = '#000000';

    adjectives = ["an amazing", "a stunning", "a poor", "a terrible", "a pathetic", "a paltry", "a superb", "a wonderful"];
    adjective = adjectives[Math.floor((Math.random() * adjectives.length))];

    text = game.add.text(game.world.centerX, game.world.centerY, "In a fit of rage the man-child blew up our planet\nYou scored " + adjective + " " + score + " points.\n\nPress any key to play again!");
    text.anchor.setTo(0.5);

    text.font = 'Six Caps';
    text.fontSize = 40;

    //  x0, y0 - x1, y1
    grd = text.context.createLinearGradient(0, 0, 0, text.canvas.height);
    grd.addColorStop(0, '#FFA500');   
    grd.addColorStop(1, '#FFFF00');
    text.fill = grd;

    text.align = 'center';
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

    var skey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    skey.onDown.addOnce(this.start, this);

  },

  start: function() {
    game.state.start('menu');
  },

};


//Finally add the game states
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('end', endState);
game.state.start('load');
