import React from 'react'

var Phaser = require('../../../node_modules/phaser/src/phaser-arcade-physics.js')


const Game = (props) => {
  console.log('jumpman.js props', props)

  var config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 1000 },
              debug: false
          }
      },
      scene: {
          preload: preload,
          create: create,
          update: update
      },
      parent: 'phaser-container'
  };

  var player;
  var stars;
  var bombs;
  var platforms;
  var cursors;
  var score = 0;
  var gameOver = false;
  var scoreText;
  var portals;
  var dot;

  var game = new Phaser.Game(config);

  function preload ()
  {
      this.load.image('dot', './assets/dot.png')
      this.load.image('portal', './assets/portal.png')
      this.load.image('sky', './assets/sky.png');
      this.load.image('smallLedge', './assets/mapleSmallLedge.png')
      this.load.image('basicLedge', './assets/mapleBasicLedge.png')
      this.load.image('ground', 'assets/mapleLedge.png');
      this.load.image('star', 'assets/star.png');
      this.load.image('bomb', 'assets/bomb.png');
      this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  function create ()
  {
      //  A simple background for our game
      this.add.image(400, 300, 'sky');

      //  The platforms group contains the ground and the 2 ledges we can jump on
      platforms = this.physics.add.staticGroup();
      portals = this.physics.add.staticGroup();
      dot = this.physics.add.staticGroup();
      //  Here we create the ground.
      //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
      platforms.create(50, 568, 'basicLedge').refreshBody();
      // platforms.create(70, 568, 'ground')

      //  Now let's create some ledges
      platforms.create(160, 510, 'smallLedge');
      platforms.create(260, 460, 'smallLedge');
      platforms.create(440, 460, 'ground');
      platforms.create(580, 410, 'smallLedge');
      platforms.create(460, 355, 'smallLedge');
      platforms.create(380, 300, 'smallLedge');
      platforms.create(300, 245, 'smallLedge');
      platforms.create(490, 230, 'ground');
      platforms.create(700, 230, 'ground');
      portals.create(750, 150, 'portal').setScale(-1).refreshBody();
      dot.create(765, 120, 'dot').refreshBody();

      // portals.create(260, 460, 'portal').refreshBody();


      // The player and its settings
      player = this.physics.add.sprite(0, 450, 'dude');

      //  Player physics properties. Give the little guy a slight bounce.
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);

      //  Our player animations, turning, walking left and walking right.
      this.anims.create({
          key: 'left',
          frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
      });

      this.anims.create({
          key: 'turn',
          frames: [ { key: 'dude', frame: 4 } ],
          frameRate: 20
      });

      this.anims.create({
          key: 'right',
          frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
          frameRate: 10,
          repeat: -1
      });

      //  Input Events
      cursors = this.input.keyboard.createCursorKeys();

      //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis

      // stars = this.physics.add.group({
      //     key: 'star',
      //     repeat: 11,
      //     setXY: { x: 12, y: 0, stepX: 70 }
      // });
      //
      // stars.children.iterate(function (child) {
      //
      //     //  Give each star a slightly different bounce
      //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      //
      // });

      bombs = this.physics.add.group();

      //  The score
      scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

      //  Collide the player and the stars with the platforms
      this.physics.add.collider(player, platforms);
      // this.physics.add.collider(stars, platforms);
      // this.physics.add.collider(bombs, platforms);

      //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
      // this.physics.add.overlap(player, stars, collectStar, null, this);
      //
      // this.physics.add.collider(player, bombs, hitBomb, null, this);
      this.physics.add.collider(player, dot, hitPortal, null, this)
  }

  function update ()
  {
      if (gameOver)
      {
          return;
      }

      if (cursors.left.isDown)
      {
          player.setVelocityX(-160);

          player.anims.play('left', true);
      }
      else if (cursors.right.isDown)
      {
          player.setVelocityX(160);

          player.anims.play('right', true);
      }
      else
      {
          player.setVelocityX(0);

          player.anims.play('turn');
      }

      if (cursors.up.isDown && player.body.touching.down)
      {
          player.setVelocityY(-330);
      }
  }

  function collectStar (player, star)
  {
      star.disableBody(true, true);

      //  Add and update the score
      score += 10;
      scoreText.setText('Score: ' + score);

      if (stars.countActive(true) === 0)
      {
          //  A new batch of stars to collect
          stars.children.iterate(function (child) {

              child.enableBody(true, child.x, 0, true, true);

          });

          var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

          var bomb = bombs.create(x, 16, 'bomb');
          bomb.setBounce(1);
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
          bomb.allowGravity = false;

      }
  }

  function hitBomb (player, bomb)
  {
      this.physics.pause();

      player.setTint(0xff0000);

      player.anims.play('turn');

      gameOver = true;

      props.gameOver(score)

  }

  function hitPortal (player, dot)
  {
      this.physics.pause();
      player.setTint(0x00ffff);
      player.anims.play('turn');
      //move next stage
      //timeout
  }

  return(
    <div id="phaser-container">
    </div>
  )

}

export default Game
