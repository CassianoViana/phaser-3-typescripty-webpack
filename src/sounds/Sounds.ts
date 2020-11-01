

export default class Sounds {
  
  scene: Phaser.Scene;
  dragSound: Phaser.Sound.BaseSound;
  dropSound: Phaser.Sound.BaseSound;
  hoverSound: Phaser.Sound.BaseSound;
  removeSound: Phaser.Sound.BaseSound;
  errorSound: Phaser.Sound.BaseSound;
  coinSound: Phaser.Sound.BaseSound;
  blockedSound: Phaser.Sound.BaseSound;
  startSound: Phaser.Sound.BaseSound;
  blinkSound: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.dragSound = scene.sound.add('drag');
    this.dropSound = scene.sound.add('drop');
    this.hoverSound = scene.sound.add('hover');
    this.removeSound = scene.sound.add('remove');
    this.errorSound = scene.sound.add('error');
    this.startSound = scene.sound.add('start');
    this.blockedSound = scene.sound.add('blocked');
    this.coinSound = scene.sound.add('coin');
    this.blinkSound = scene.sound.add('blink');
  }


  drag() {
    this.dragSound.play()
  }

  drop() {
    this.dropSound.play()
  }

  hover() {
    //this.hoverSound.play()
  }

  remove() {
    this.removeSound.play()
  }

  error() {
    this.errorSound.play()
  }

  coin() {
    this.coinSound.play()
  }

  start() {
    this.startSound.play()
  }

  blocked() {
    this.blockedSound.play()
  }

  stop() {
    //this.blockedSound.play()
  }

  blink() {
    this.blinkSound.play()
  }


}
