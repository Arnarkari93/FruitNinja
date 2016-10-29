import PIXI from 'pixi.js';
import { Config, imageMappings } from './config.js';
import BaseContainer from './basecontainer.js';
import { isIntersecting } from './helpers.js'

export default class GamePlayContainer extends BaseContainer {

  constructor(mode) {
    super();
    this.mode = mode;
    this.loaded = false;
    this.loadTextures();
  }

  fruitsLoaded() {
    this.loaded = true; // Assuming all other loaders would be loaded
                // when they will be accessed
    console.log("Fruits loaded");
  }

  halfFruitsLoaded() {
    console.log("Half fruits loaded");
  }

  splashesLoaded() {
    console.log("Splashes loaded");
  }

  handleOptionSelection() {
  }

  loadTextures() {
    PIXI.loader
      .add('assets/fruits.json')
      .load(() => {
        let self = this;
        self.fruitsLoaded();
      });
    PIXI.loader
      .add('assets/halffruits.json')
      .load(() => {
        let self = this;
        self.halfFruitsLoaded();
      });
    PIXI.loader
      .add('assets/splashes.json')
      .load(() => {
        let self = this;
        self.splashesLoaded();
      });
  }

  startSpecialFruitEffect() {
      // Add layer
      const layer = new PIXI.Graphics();
      layer.beginFill(0x812390, 1);
      layer.drawRect(0, 0, renderer.width, renderer.height);
      layer.alpha = 0.4;
      this.layer = layer;
      this.addChild(layer);

      // Set other parameters
  }

  endSpecialFruitEffect() {
    // Remove child
    this.removeChild(this.layer);

    // Reset other parameters
  }

  addNewFruit() {
    function intializeDetails() {

      let conf = {
        x: Math.random()*Config.ww,
        y: Config.wh,
        vx: Math.max(1, Math.random()*Config.fruit.vx),
        vy: Config.fruit.vy,
        width: Config.fruit.size,
        height: Config.fruit.size,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        omega: (Math.random()*0.01)*(Math.random() > 0.5 ? 1 : -1),
      };

      if(conf.x > Config.ww/2)
        conf.vx *= -1;

      return conf;
    }

    let details = intializeDetails();
    // Randomly select a new fruit
    // TODO: randomly select special fruits and bombs too
    let id = Math.floor(Math.random()*imageMappings.numFruits);
    id = `fruit${id}`;

    let fruit = new PIXI.Sprite(PIXI.Texture.fromFrame(id+".png"));
    fruit.id = id;
    Object.assign(fruit, details);
    this.add('fruits', fruit);
  }

  animate() {
    // Images not loaded
    if(!this.loaded) return;

    if(this.parent.pause) return;

    // Handle if there is any fruit cut
    let noFruitCuts = 0;
    if(this.parent.cutting)
      noFruitCuts = this.handleNewFruitCuts();

    // Handle animations for fruits
    function animateFruits(self) {
      let count = 0;
      let fruits = self.getAll('fruits');
      let fruitsMissed = 0;
      for(let fruit of fruits) {
        if (fruit.y > Config.wh) {
          fruitsMissed += 1;
          self.remove('fruits', fruit.name);
        }
        else {
          fruit.x += fruit.vx;
          fruit.y += fruit.vy;
          fruit.vy += Config.acc;
          fruit.rotation += fruit.omega;
        }
        count++;
      }
      if (count < 10)
        self.addNewFruit();
      return fruitsMissed;

    }
    let fruitsMissed = animateFruits(this);

    // Handle animations for drops
    function animateDrops(self) {
      // Remove drops with r <= 0 by reverse traversing
      let drops = self.getAll('drops');

      for(let drop of drops) {
        if(drop.height <= 0)
          self.remove('drops', drop.name);
        else {
          // Move drops while decreasing size
          drop.x += drop.vx;
          drop.y += drop.vy;
          drop.height -= 1;
          drop.width -= 1;
        }
      }
    }
    /*animateDrops(this);*/

    // Handle animations for cut fruits
    function animateCutFruits(self) {
      let halfFruits = self.getAll('halfFruits');

      for(let hf of halfFruits) {
        if(hf.alpha <= 0)
          self.remove('halfFruits', hf.name);
        else {
          // Decrease alpha
          hf.x += hf.vx;
          hf.y += hf.vy;
          hf.vy += Config.acc;
        }
      }
    }
    animateCutFruits(this);

    // Handle animations for splashes
    function animateSplashes(self) {
      let splashes = self.getAll('splashes');
      for(let splash of splashes) {
        if(splash.alpha <= 0)
          self.remove('splashes', splash.name);

        else
          splash.alpha -= 0.01;
      }
    }
    animateSplashes(this);

    this.updateScore({
      'missed': fruitsMissed,
      'cut': noFruitCuts
    });
  }

  initializeScore() {
    /*let scoreBoard = */
  }

  updateScore(data) {

  }

  handleNewFruitCuts() {
    // Handle fruit cuts and it's animation Initializations. Progress
    // of animations is handled in animation function itself.

    function checkIfIntersection(mouseData, fruit) {
      if(mouseData.length < 2) return false;

      let p1, p2;
      [p1, p2] = [...mouseData];

      return isIntersecting(p1, p2, fruit);
    }

    function initializeDrops(self, fruit) {

      function getNewDrop(details) {
        const drop = new PIXI.Graphics();
        drop.lineStyle(2, details.color);
        drop.beginFill(details.color, 1);
        drop.drawCircle(details.x, details.y, details.radius);
        drop.endFill();
        drop.vx = details.vx; drop.vy = details.vy;
        return drop;
      }

      for(let i = 0; i < 40; i++) {
        let vx = Math.floor(Math.random()*10);
        let vy = Math.floor(Math.random()*10);
        let radius = Config.drops.rad;
        if(Math.floor(Math.random()*2))
          vx = -vx;
        if(Math.floor(Math.random()*2))
          vy = -vy;

        let mapping = imageMappings[fruit.id];
        let details = {
          'x': fruit.x,
          'y': fruit.y,
          vx,
          vy,
          radius,
          color: mapping.color,
        };
        self.add('drops', getNewDrop(details));
      }
    }

    function initializeCutFruit(self, fruit) {

      let mapping = imageMappings[fruit.id];

      let hf1 = new PIXI.Sprite(PIXI.Texture.fromFrame(mapping.hf1+".png"));
      let hf2 = new PIXI.Sprite(PIXI.Texture.fromFrame(mapping.hf2+".png"));

      let details = {
        'x': fruit.x,
        'y': fruit.y,
        'vx': fruit.vx,
        'vy': fruit.vy,
        'width': Config.halfFruit.size,
        'height': Config.halfFruit.size,
      };

      Object.assign(hf1, details, {'x': fruit.x-25});
      Object.assign(hf2, details, {'x': fruit.x+25});

      self.add('halfFruits', hf1);
      self.add('halfFruits', hf2);
    }

    function initializeSplash(self, fruit) {
      let mapping = imageMappings[fruit.id];

      let splash = new PIXI.Sprite(PIXI.Texture.fromFrame(mapping.splash+".png"));

      let details = {
        'x': fruit.x,
        'y': fruit.y,
        'vx': fruit.vx,
        'vy': fruit.vy,
        'width': Config.splash.size,
        'height': Config.splash.size,
      };

      Object.assign(splash, details);

      self.add('splashes', splash);
    }

    let mouseData = this.parent.mouseData;

    let noFruitCuts = 0
    let fruits = this.getAll('fruits');
    for(let fruit of fruits) {
      // No intersection
      if(!checkIfIntersection(mouseData, fruit))
        continue

      noFruitCuts += 1;
      // Fruit cut successfull: Add splas, drops and remove fruit
      initializeDrops(this, fruit);
      initializeSplash(this, fruit);
      initializeCutFruit(this, fruit);
      this.remove('fruits', fruit.name);
    }
  }

  resize() {

  }

// End class
}

