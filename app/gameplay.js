/**
 * Implements final game container with all the logic
 * related to fruits, cut fruits, splashes and drops
 */

import PIXI from 'pixi.js';

import { Config, imageMappings } from './config';
import BaseContainer from './basecontainer';
import { isIntersecting } from './helpers';
import { LoaderContainer } from './others';


export default class GamePlayContainer extends BaseContainer {

  constructor(mode) {
    super();

    this.filesToLoad = 4;
    this.filesLoaded = 0;
    this.startTime = +new Date;
    this.mode = mode;
    this.score = 0;
    this.missed = 0;
    this.loadTextures();
  }

  assetLoaded() {
    this.filesLoaded += 1;
  }

  handleOptionSelection() {
    // For pause, resume, and back
  }

  loadTextures() {
    PIXI.loader
      .add('assets/fruits.json')
      .load(() => {
        this.assetLoaded();
      });
    PIXI.loader
      .add('assets/halffruits.json')
      .load(() => {
        this.assetLoaded();
      });
    PIXI.loader
      .add('assets/splashes.json')
      .load(() => {
        this.assetLoaded();
      });
    PIXI.loader
      .add('assets/nums.json')
      .load(() => {
        this.assetLoaded();
      });
  }

  addNewFruit() {
    const details = {
      x: (Math.random() * (Config.ww - 200)) + 50,
      y: Config.wh,
      vx: Math.max(1, Math.random() * Config.fruit.vx),
      vy: Config.fruit.vy,
      width: Config.fruit.size,
      height: Config.fruit.size,
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      omega: Math.random() * 0.01 * (Math.random() > 0.5 ? 1 : -1),
    };

    if (details.x > Config.ww / 2)
      details.vx *= -1;

    // Randomly select a fruit
    let id = Math.floor(Math.random() * imageMappings.numFruits);
    id = `fruit${id}`;

    const fruit = new PIXI.Sprite(PIXI.Texture.fromFrame(`${id}.png`));
    fruit.id = id;
    Object.assign(fruit, details);
    this.add('fruits', fruit);
  }

  animate() {
    if (this.parent.pause) return;

    // Define animation function for all elements

    const animateLoader = () => {
      let percentage = this.filesLoaded / this.filesToLoad;
      percentage = Math.max(percentage, (+new Date - this.startTime) / 500);
      percentage = Math.min(percentage, 1);

      this.remove('loaderContainer');
      const loader = new LoaderContainer(percentage);
      this.add('loaderContainer', loader);
    };

    const animateFruits = () => {
      let count = 0, fruitsMissed = 0;

      for (const fruit of this.getAll('fruits')) {
        if (fruit.y > Config.wh) {
          fruitsMissed += 1;
          this.remove('fruits', fruit.name);
        } else {
          fruit.x += fruit.vx;
          fruit.y += fruit.vy;
          fruit.vy += Config.acc;
          fruit.rotation += fruit.omega;
        }
        count += 1;
      }

      if (count < 5)
        this.addNewFruit();

      return fruitsMissed;
    };

    const animateSplashes = () => {
      for(const splash of this.getAll('splashes')) {
        if(splash.alpha <= 0)
          this.remove('splashes', splash.name);
        else
          splash.alpha -= 0.01;
      }
    };

    const animateCutFruits = () => {
      for (const hf of this.getAll('halfFruits')) {
        if (hf.alpha <= 0)
          this.remove('halfFruits', hf.name);
        else {
          hf.x += hf.vx;
          hf.y += hf.vy;
          hf.vy += Config.acc;
        }
      }
    };

    const animateDrops = () => {
      for (const drop of this.getAll('drops')) {
        if (drop.scale.x < 0)
          this.remove('drops', drop.name);
        else {
          // Move drops while decreasing size
          const details = drop.details;
          drop.x += details.vx;
          drop.y += details.vy;
          drop.scale.x -= 0.05;
          drop.scale.y -= 0.05;
        }
      }
    };

    const animateScoreBoard = () => {
      let score = this.score, chars = [];
      while (score > 0) {
        chars.unshift(score % 10);
        score = Math.floor(score/10);
      }
      if (chars.length === 1)
        chars.unshift(0);
      if (chars.length === 0)
        chars = [0, 0]

      let x = 80, y = 50;

      this.remove('scoreContainer');
      for (let char of chars) {
        const gr = new PIXI.Sprite(PIXI.Texture.fromFrame(`num${char}.png`));
        gr.width = 40;
        gr.height = 50;
        gr.x = x;
        gr.y = y;
        x += 50;
        this.add('scoreContainer', gr);
      }
    };

    const animateZenMode = () => {
      let cross = [];
      for (let i = 0; i < this.missed && i < 3; i += 1) {
        // Push red cross
        cross.push('r');
      }
      while (cross.length < 3) {
        // Push black cross
        cross.push('b');
      }

      let x = Config.ww - 250, y = 100;

      this.remove('crossContainer');

      for (let c of cross) {
        const gr = new PIXI.Sprite(PIXI.Texture.fromFrame(`${c}cross.png`));
        gr.x = x;
        gr.y = y;
        gr.width = 30;
        gr.height = 30;
        x += 40;
        this.add('crossContainer', gr);
      }
    };

    const animateArchadeMode = () => {
      let seconds = 60 - Math.floor((+new Date - this.startTime) / 1000);
      if (seconds < 0) return;
      let mins = Math.floor(seconds / 60);
      let secs = seconds % 60;
      secs = [Math.floor(secs / 10), secs % 10];

      let score = [mins, '10', ...secs]; // '10' is for ':'
      let x = Config.ww - 250, y = 70;

      this.remove('timeContainer');

      for (let s of score) {
        const gr = new PIXI.Sprite(PIXI.Texture.fromFrame(`num${s}.png`));
        gr.x = x;
        gr.y = y;
        gr.width = 40;
        gr.height = 50;
        this.add('timeContainer', gr);
        x += 50;
      }
    };

    // Images not loaded yet
    if ((this.filesLoaded < this.filesToLoad) ||
        (+new Date - this.startTime) / 1000 < 0.5) {
      animateLoader();
      return;
    }

    this.remove('loaderContainer');

    if(this.parent.cutting)
      this.score += this.handleNewFruitCuts();

    this.missed += animateFruits();

    animateDrops();

    animateCutFruits();

    animateSplashes();

    animateScoreBoard();

    if(this.mode === 'archade mode')
      animateArchadeMode();
    else if(this.mode === 'zen mode')
      animateZenMode();
  }

  handleNewFruitCuts() {
    /**
     * Handle fruit cuts and it's animation Initializations. Further
     * animation is handled in animation function itself.
     */

    const checkIfIntersection = (mouseData, fruit) => {
      if(mouseData.length < 2) return false;

      let p1, p2;
      [p1, p2] = [...mouseData];

      return isIntersecting(p1, p2, fruit);
    };

    const getNewDrop = (details) => {
      const drop = new PIXI.Graphics();
      drop.x = details.x;
      drop.y = details.y;
      drop.lineStyle(2, details.color);
      drop.beginFill(details.color, 1);
      drop.drawCircle(0, 0, details.radius);
      drop.endFill();
      drop.vx = details.vx; drop.vy = details.vy;
      //drop.visible = details.visible;
      drop.details = details;
      return drop;
    };

    const initializeDrops = (fruit) => {
      for (let i = 0; i < 40; i += 1) {
        let vx = Math.floor(Math.random() * 10);
        let vy = Math.floor(Math.random() * 10);
        let radius = Config.drops.rad;

        if (Math.floor(Math.random() * 2))
          vx = -vx;
        if (Math.floor(Math.random() * 2))
          vy = -vy;

        const mapping = imageMappings[fruit.id];
        const details = {
          x: fruit.x,
          y: fruit.y,
          vx,
          vy,
          radius,
          color: mapping.dropColor,
          //visibleID: (Math.floor(Math.random()*2) === 0)
        };
        this.add('drops', getNewDrop(details));
      }
    };

    const initializeCutFruit = (fruit) => {
      const mapping = imageMappings[fruit.id];

      const hf1 = new PIXI.Sprite(PIXI.Texture.fromFrame(`${mapping.hf1}.png`));
      const hf2 = new PIXI.Sprite(PIXI.Texture.fromFrame(`${mapping.hf2}.png`));

      const details = {
        x: fruit.x,
        y: fruit.y,
        vx: fruit.vx,
        vy: fruit.vy,
        width: Config.halfFruit.size,
        height: Config.halfFruit.size,
      };

      Object.assign(hf1, details, {x: fruit.x - 25});
      Object.assign(hf2, details, {x: fruit.x + 25});

      this.add('halfFruits', hf1);
      this.add('halfFruits', hf2);
    };

    const initializeSplash = (fruit) => {
      const mapping = imageMappings[fruit.id];

      const splash = new PIXI.Sprite(PIXI.Texture.fromFrame(`${mapping.splash}.png`));

      const details = {
        x: fruit.x,
        y: fruit.y,
        vx: fruit.vx,
        vy: fruit.vy,
        width: Config.splash.size,
        height: Config.splash.size,
      };

      Object.assign(splash, details);

      this.add('splashes', splash);
    };

    const mouseData = this.parent.mouseData;

    let noFruitCuts = 0;
    for (let fruit of this.getAll('fruits')) {
      if (!checkIfIntersection(mouseData, fruit.getBounds()))
        continue;

      noFruitCuts += 1;

      // Fruit cut successfull: Add splashes, drops and remove fruit
      initializeDrops(fruit);
      initializeSplash(fruit);
      initializeCutFruit(fruit);

      this.remove('fruits', fruit.name);
    }
    return noFruitCuts;
  }

  resize() {

  }

}
