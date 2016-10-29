import PIXI from 'pixi.js';
import BaseContainer from './basecontainer.js';
import { isIntersecting } from './helpers.js';

export class OptionsContainer extends BaseContainer {
  // Responsible for drawing options on board
  // This assumes that assets are already loaded

  constructor(options) {
    super();
    this.x = 150;
    this.y = 400;
    this.optionNames = options;
    this.drawCircles();
  }

  drawCircles() {
    for(let i=0; i<3; i++) {
      option.width = 200; option.height = 200;
      option.x = 250*i;
      if(i == 1) option.y = -100;
      this.add('optionCircles', option);
    }
  }

  detectSelection(mouseData) {

    if(mouseData.length < 2) return;

    let [p1, p2] = mouseData;

    let optionCircles = this.getAll('optionCircles');

    for(let i=0; i < optionCircles.length; i++) {
      let option = optionCircles[i];
      if(isIntersecting(p1, p2, option))
        return this.optionNames[i];
    }
    return;
  }

  drawText() {
    let imageExtraPadding = 20;
    let optionCircles = this.getAll('optionCircles');

    for(let i=0; i < optionCircles.length; i++){
      let option = optionCircles[i];
      let r = option.width/2;
      let text = this.optionNames[i].split(" ");
      text.forEach((word, i) => {
        word = word[0].toUpperCase() + word.slice(1);
        text[i] = word;
      })
      text = text.join(" ");
      let textContainer = new TextOnPerimiterContainer({
                              'x': option.x + r,
                              'y': option.y + r
                            }, r - imageExtraPadding,
                            text, {}
                          );
      this.add('textsContainer', textContainer);
    }
  }

  drawFruit() {
    let optionCircles = this.getAll('optionCircles');

    for(let i=0; i < optionCircles.length; i++){
      let option = optionCircles[i];
      let r = option.width/2;
      let fruit = new PIXI.Sprite(PIXI.Texture.fromFrame(`option${i}.png`));
      fruit.anchor.x = 0.5; fruit.anchor.y = 0.5;
      fruit.width = 4*r/5; fruit.height = 4*r/5;
      fruit.x = option.x + r; fruit.y = option.y + r;
      fruit.rotation -= 1;
      this.add('fruitsContainer', fruit);
    }
  }

  animate() {
    this.getAll('textsContainer').forEach((text) => {
      text.animate();
    });

    // animate fruits
    this.getAll('fruitsContainer').forEach((fruit, i) => {
      let rotation = 0.05;
      if(i == 1)
        fruit.rotation -= rotation;
      else
        fruit.rotation += rotation;
    });
  }
// End class
}

export class TextOnPerimiterContainer extends BaseContainer {

  constructor(center, radius, text, style) {
    super();
    this.center = center;
    this.r = radius;
    this.text = text;
    this.style = style;
    this.drawText();
  }

  drawText() {
    // PIXI pivot abnormal behaviour
    let theta = Math.PI/4;
    for(let i=0; i<this.text.length; i++) {
      let text = new PIXI.Text(this.text[i], this.style);
      text.anchor.x = 0.5; text.anchor.y = 0.5;
      text.pivot.x = 0;
      text.x = this.center.x;
      text.pivot.y = this.r;
      text.y = text.pivot.y + (this.center.y - this.r);
      console.log(text.pivot.y);
      text.rotation = theta + i*0.3;
      this.addChild(text);
    }
  }

  animate() {
    this.children.forEach((text) => {
      text.rotation += 0.01;
    });
  }
// End class
}
