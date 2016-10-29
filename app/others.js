import PIXI from 'pixi.js';
import BaseContainer from './basecontainer.js';
import { isIntersecting } from './helpers.js';
import { Config } from './config.js';

class TemplateWithBack extends BaseContainer {
  // Template holding back functionality in bottom right corner

  constructor(...args) {
    console.log('in init');
    super(...args);

    let back = new PIXI.Sprite(PIXI.Texture.fromFrame('back.png'));
    back.anchor.x = 0.5;
    back.anchor.y = 0.5;
    back.x = Config.ww*4/5;
    back.y = Config.wh*8/10;
    this.add('back', back);
  }

  animate() {
    this.get('back').rotation += 0.1;
  }

  detectSelection(mouseData) {
    if(mouseData.length < 2) return;

    let [p1, p2] = mouseData;
    console.log(isIntersecting(p1, p2, this.get('back')));
    if(isIntersecting(p1, p2, this.get('back')))
      return true;
  }

  handleOptionSelection() {
    let mouseData = this.parent.mouseData;
    return this.detectSelection(mouseData);
  }
}

export class HighScoreContainer extends TemplateWithBack {

  constructor(...args) {
    super(...args);
    this.init();
  }

  init() {
    let label = new PIXI.Sprite.fromImage('assets/highscore.png');
    label.anchor.x = 0.5; label.anchor.y = 0.5;
    label.width = 300;
    label.x = Config.ww/2;
    label.y = Config.wh * 1/4;
    this.addChild(label);
  }
}

export class AboutGameContainer extends TemplateWithBack {

  constructor(...args) {
    super(...args);
    this.init();
  }

  init() {
    let board = new PIXI.Sprite.fromImage('assets/board.png');
    board.width = 600;
    board.x = 100;
    board.y = 100;
    this.addChild(board);

    let content = "In Fruit Ninja, the player slices fruit with a blade controlled via the mouse. As the fruit \
is thrown onto the screen, the player swipes the mouse pointer across the screen to \
create a slicing motion, attempting to slice the fruit in half.Extra points are awarded for \
slicing multiple fruits with one swipe, Players must slice all fruit if three fruits are missed, \
the game end. Bombs are occasionally thrown onto the screen, and will also end the game \
should the player slice them."

    let text = new PIXI.Text(content, {
                fontFamily : 'Comic Sans MS',
                align : 'center',
                fontSize: 30,
                wordWrap: true,
                wordWrapWidth: board.width - 50,
               });
    text.x = board.x + 30;
    text.fontSize = 5;
    text.y = board.y + 50;;
    this.addChild(text);
  }
}
