import './index.html';
import PIXI from 'pixi.js';
import { FruitsContainer } from './fruits.js';
import Knife from './knife.js';

const renderer = PIXI.autoDetectRenderer(window.innerWidth,
  window.innerHeight, {
  antialiasing: false,
  transparent: false,
  resolution: window.devicePixelRatio,
  autoResize: true,
  backgroundColor: 0x999999
});

document.body.appendChild(renderer.view);

class Root extends PIXI.Container {
  constructor(...args) {
    super(...args);
    this.h = window.innerHeight;
    this.w = window.innerWidth;
    this.interactive = true;
    this.pause = false;
    this.cutting = false; // true if Knife in cutting mode
    this
      .on('mousedown', this.onMouseDown)
      .on('mouseup', this.onMouseUp)
      .on('mousemove', this.onMouseMove)
      .on('click', this.onClick)

    // Add background
    let bg = new PIXI.Sprite.fromImage('assets/bg.png');
    bg.height = this.h; bg.width = this.w;
    bg.interactive = true;
    this.addChild(bg);

    // Add fruits container
    this.fruitsContainer = new FruitsContainer();
    this.addChild(this.fruitsContainer);

  }

  animate() {
    if(this.pause) return;
    this.fruitsContainer.animate();
  }

  onClick(x) {
    this.pause = !this.pause;
  }

  onMouseDown(x) {
    this.cutting = true;

    let tmp = x.data.global;
    console.log(tmp.x, tmp.y);

    this.knife = new knife();
    this.addChild(this.knife);
  }

  onMouseUp(x) {
    let tmp = x.data.global;
    if (this.mousepress){
      console.log(tmp.x, tmp.y);
      console.log(x);
    }

    this.cutting = false;
    this.removeChild(this.knife);
  }

  onMouseMove(x) {
    let tmp = x.data.global;
    if (this.cutting){
      console.log(tmp.x, tmp.y);
      /*console.log(x);*/
    }
  }
}

const stage = new Root();

/*function resize(){
  stage.scale.x = stage.scale.y = (RATIO*window.innerWidth/GAME_WIDTH);
  renderer.resize(Math.ceil(window.innerWidth * RATIO),
                  Math.ceil(window.innerWidth * RATIO * 7/8));
}
*/
function animate() {
  stage.animate();
  renderer.render(stage);
  requestAnimationFrame(animate);
}

animate();

