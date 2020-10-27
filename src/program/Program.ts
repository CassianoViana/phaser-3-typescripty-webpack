import { GameObjects } from 'phaser'
import Command from './Command'
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import DropZone from '../controls/DropZone';
import drawRect, { createDropZone } from '../utils/Utils';

export default class Program {


  commands: Command[];
  scene: Phaser.Scene;
  dropZone: DropZone;
  sounds: Sounds;
  grid: AlignGrid;
  name: string;
  parent: Program;
  programNameImage: GameObjects.Image;
  animated: any;

  constructor(scene: Phaser.Scene, name: string, sounds: Sounds, grid: AlignGrid, x: number, y: number, width: number, height: number, sprite: string) {
    this.scene = scene;
    this.name = name;
    this.sounds = sounds;
    this.grid = grid;
    this.commands = new Array();
    this.dropZone = createDropZone(this.grid, x, y, width, height, sprite);
    this.programNameImage = this.grid.addImage(x - 1.75, y - 0.15, name, 2, 3);
  }

  animate() {
    if (!this.animated) {
      this.programNameImage.scale += 0.1
      this.programNameImage.rotation += 0.05
      this.animated = true;
    }
  }

  disanimate() {
    if (this.animated) {
      this.programNameImage.scale -= 0.1
      this.programNameImage.rotation -= 0.05
      this.animated = false;
    }
  }

  addCommands(commands: string[]) {
    commands.forEach(command => {
      const commandSprite = this.scene.add.sprite(0, 0, command).setScale(this.grid.scale)
      this.addCommandBySprite(commandSprite)
    })
  }

  disanimateCommands() {
    this.commands.forEach(c => c.disanimateSprite());
  }

  addCommand(command: Command) {
    command.dropZone = this.dropZone.zone;
    if (this.commands.indexOf(command) == -1) {
      this.sounds.drop();
      this.commands.push(command);
      console.log('ADD_REMOVE_COMMANDS', this.commands)
    } else {
      console.log('ADD_REMOVE_COMMANDS', "ALREADY ADDED")
    }
    let fit = this.organizeInProgramArea(command);
    if (!fit) {
      command.removeSelf();
    }
  }

  addCommandBySprite(sprite: GameObjects.Sprite) {
    let command = this.findCommandBySprite(sprite);
    if (!command) {
      command = new Command(this.scene, sprite);
      command.setProgram(this);
    }
  }

  findCommandBySprite(sprite: GameObjects.Sprite): Command {
    const commands = this.commands.filter(c => c.sprite === sprite);
    let command: Command;
    if (commands.length > 0) {
      command = commands[0]
    }
    return command;
  }

  organizeInProgramArea(command: Command) {
    const zone = this.dropZone.zone;
    const index = this.commands.indexOf(command);
    const spriteWidth = command.sprite.width * this.grid.scale;
    const spriteHeight = command.sprite.height * this.grid.scale * 1.4;

    console.log('COMMAND_ALLOCATE_AREA', spriteWidth, spriteHeight)

    const cols: integer = Math.floor(zone.width / spriteWidth);
    const rows: integer = Math.floor(zone.height / spriteHeight);

    const tileWidth = spriteWidth + (zone.width - spriteWidth * cols) / cols
    const tileHeight = spriteHeight + (zone.height - spriteHeight * rows) / rows

    const row = Math.floor(index / cols) * tileHeight;
    let fitInFirstRow = row == 0;

    let x = zone.x + (index % cols * tileWidth) + spriteWidth * 0.5;
    let y = zone.y + row + spriteHeight * 0.5;
    //let y = zone.y + Math.floor(index / cols) * tileHeight + spriteHeight * 0.5;
    command.setPosition(x, y);
    drawRect(this.scene, x - spriteWidth / 2, y - spriteHeight / 2, spriteWidth, spriteHeight);

    return fitInFirstRow;
  }

  removeCommandSprite(commandSprite: GameObjects.Sprite) {
    this.scene.children.remove(commandSprite);
    this.sounds.remove();
  }

  removeCommand(command: Command, removeSpriteFromScene: Boolean = false) {
    if (removeSpriteFromScene) {
      this.removeCommandSprite(command.sprite);
    }
    let index = this.commands.indexOf(command);
    this.commands.splice(index, 1);
    console.log('ADD_REMOVE_COMMANDS', this.commands)
    this.commands.forEach((command: Command) => {
      this.organizeInProgramArea(command);
    })
  }

  clear() {
    let commands = this.commands.splice(0)
    commands.forEach(c=>c.removeSelf());
    this.commands = []
  }
}
