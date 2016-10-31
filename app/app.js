import './index.html';
import PIXI from 'pixi.js';
import BaseContainer from './basecontainer.js';
import Knife from './knife.js';
import GameOptionsContainer from './gameoptions.js';
import GamePlayContainer from './gameplay.js';
import { HighScoreContainer, AboutGameContainer, StateTransitionContainer } from './others.js';
import { Config } from './config.js';

const renderer = PIXI.autoDetectRenderer(window.innerWidth,
  window.innerHeight, {
  antialiasing: false,
  transparent: false,
  resolution: window.devicePixelRatio,
  autoResize: true,
  backgroundColor: 0x999999
});

document.body.appendChild(renderer.view);

class Root extends BaseContainer {
  constructor(...args) {
    super(...args);
    this.h = Config.wh;
    this.w = Config.ww;
    this.interactive = true;

    this.mode = 1; // game has three modes
    this.pause = false;
    this.cutting = false; // true if Knife in cutting mode
    this.transitioning = false; // true when transitioning from one
                                // state to other
    this.mouseData = []; // data of mouse movement

    this.containerChange = false;
    this.counter = 0;
    this
      .on('mousedown', this.onMouseDown())
      .on('touchstart', this.onMouseDown())
      .on('mousemove', this.onMouseMove())
      .on('touchmove', this.onMouseMove())
      .on('mouseup', this.onMouseUp())
      .on('mouseupoutside', this.onMouseUp())
      .on('touchend', this.onMouseUp())
      .on('touchendoutside', this.onMouseUp())
      //.on('click', this.onClick)

    this.state = "initial";
    this.load = false;
    this.loadTextures();
  }

  gameInit() {
    let bg = new PIXI.Sprite(PIXI.Texture.fromFrame('bg.png'));
    bg.height = this.h; bg.width = this.w;
    bg.interactive = true;
    this.add('bg', bg);

    let options = ["about game", "new game", "high score"];
    let gameContainer = new GameOptionsContainer(options);
    this.add('gameContainer', gameContainer);
  }

  assetsLoaded() {
    console.log("Initial assets loaded");
    this.gameInit();
    this.load = true;
    resize();
  }

  loadTextures() {
    PIXI.loader
      .add('assets/basics.json')
      .load(() => {
        let self = this;
        self.assetsLoaded();
      });
  }

  onClick(x) {
    this.pause = !this.pause;
  }

  onMouseDown() {
    return (x) => {
      let self = this;
      self.cutting = true;
      let position = x.data.global;
      self.mouseData.push({
        x: position.x,
        y: position.y
      });
      self.add('knife', new Knife());
    };
  }

  onMouseUp() {
    return (x) => {
      this.cutting = false;
      this.remove('knife');
      this.mouseData = [];
    };
  }

  onMouseMove() {
    let self = this;
    return (x) => {
      let position = x.data.global;
      if(self.cutting) {
        self.mouseData.push({
          x: position.x,
          y: position.y
        });

        // Keep only last two datapoints
        if(self.mouseData.length == 3)
          self.mouseData.shift();
      }
    };
  }

  reduceInitial(action) {
    // Reduce from Initial state to next state
    // Possible actions: about game, new game, high score
    let gameContainer;

    switch(action) {
      case "about game":
        gameContainer = new AboutGameContainer();
        break;
      case "new game":
        let options = ["archade mode", "zen mode", "back"];
        gameContainer = new GameOptionsContainer(options);
        break;
      case "high score":
        gameContainer = new HighScoreContainer();
        break;
    }
    return gameContainer;
  }

  reduceNewGame(action) {
    // Possible actions: zen mode, archade mode, back
    let gameContainer;

    switch(action) {
      case "zen mode":
      case "archade mode":
        gameContainer = new GamePlayContainer(action);
        break;
      case "back":
        let options = ["about game", "new game", "high score"];
        gameContainer = new GameOptionsContainer(options);
        break;
    }
    return gameContainer;
  }

  reduce(action) {
    // Switch to new state based on action

    let prevState = this.state;

    if(this.state == "about game" || this.state == "high score")
      this.state = "initial";
    else
      this.state = action;

    let gameContainer;

    switch(prevState) {
      case "initial":
        gameContainer = this.reduceInitial(action);
        break;
      case "about game":
      case "high score":
        // go back
        let options = ["about game", "new game", "high score"];
        gameContainer = new GameOptionsContainer(options);
        break;
      case "new game":
        gameContainer = this.reduceNewGame(action);
        break;
    }
    return gameContainer;
  }

  startStateTransitionAnimation() {
    this.transitioning = true;
    this.transitionTimer = 100;
    let stateTransitionContainer = new StateTransitionContainer();
    this.add('stateTransitionContainer', stateTransitionContainer);
    resizeTransitionContainer();
  }

  animate() {
    if(this.pause || !this.load) return;

    this.get('gameContainer').animate();

    if(this.transitioning) {
      this.get('stateTransitionContainer').animate();
      if(this.transitionTimer <= 0) {
        this.remove('stateTransitionContainer');
        this.remove('gameContainer');
        let gameContainer = this.reduce(this.transitionAction);
        this.add('gameContainer', gameContainer);
        this.containerChange = true;
        resizeGameContainer();
        this.transitioning = false;
      }
      this.transitionTimer -= 1;
    }
    else {
      let action = this.get('gameContainer').handleOptionSelection();
      if(action != undefined) {
        this.transitionAction = action;
        this.startStateTransitionAnimation();
      }
    }

    if(this.get('knife') != undefined)
      this.get('knife').animate();
  }

// End class
}

const stage = new Root();


function resizeGameContainer() {

  let gameContainer = stage.get('gameContainer');
  let state = stage.state;
  if(state == "archade mode" || state == "zen mode") {
    if(stage.containerChange) {
      gameContainer.scale.x *= window.innerWidth/Config.ww;
      gameContainer.scale.y *= window.innerHeight/Config.wh;
      stage.containerChange = false;
    }
    else {
      gameContainer.scale.x *= renderer.width/stage.w - 0.1;
      gameContainer.scale.y *= renderer.height/stage.h;
    }
  }
  else {
    if(stage.containerChange) {
      let scale = window.innerHeight/Config.wh;
      if(window.innerHeight < 400) scale += 0.05;
      // let scale = window.innerWidth/Config.ww;
      gameContainer.scale.x *= scale;
      gameContainer.scale.y *= scale;
      stage.containerChange = false;
    }
    else {
      let scale = renderer.height/stage.h;
      if(renderer.width < 400) scale += 0.05;
      // let scale = window.innerWidth/Config.ww;
      gameContainer.scale.x *= scale;
      gameContainer.scale.y *= scale;
    }
  }
}

function resize(){
  // Called after load is complete
  renderer.resize(window.innerWidth, window.innerHeight);

  let bg = stage.get('bg');
  bg.scale.x *= renderer.width/stage.w;
  bg.scale.y *= renderer.height/stage.h;
  // resize transition animation too
  resizeGameContainer();

  stage.w = renderer.width;
  stage.h = renderer.height;
}
/*

function resizeGameContainer() {
  let gameContainer = stage.get('gameContainer');
  let state = gameContainer.state;
  if(state == "archade mode" || state == "zen mode") {
    gameContainer.scale.x *= window.innerWidth/Config.ww;
    gameContainer.scale.y *= window.innerHeight/Config.wh;
  }
  else {
    let scale = window.innerHeight/Config.wh;
    if(window.innerHeight < 400) scale += 0.05;
    // let scale = window.innerWidth/Config.ww;
    gameContainer.scale.x *= scale;
    gameContainer.scale.y *= scale;
  }
}

function resize(){
  // Called after load is complete

  let bg = stage.get('bg');
  bg.scale.x *= window.innerWidth/Config.ww;
  bg.scale.y *= window.innerHeight/Config.wh;
  // resize transition animation too

  resizeGameContainer();
  renderer.resize(window.innerWidth, window.innerHeight);
}*/

function resizeTransitionContainer() {

}

function animate() {
  stage.animate();
  renderer.render(stage);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
animate();


