import PIXI from 'pixi.js';
import { Config, imageMappings } from './config.js';
import BaseContainer from './basecontainer.js';
import { isIntersecting } from './helpers.js'

export default class GamePlayContainer extends BaseContainer {

  constructor(mode) {
    super();
    this.mode = mode;
    this.loaded = false;
    this.score = 0;
    this.missed = 0;
    this.timestart = +new Date;
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

  numsLoaded() {
    console.log("Numbers loaded");
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
    PIXI.loader
      .add('assets/nums.json')
      .load(() => {
        let self = this;
        self.numsLoaded();
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
        x: Math.random()*(Config.ww-200) + 50,
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
      if (count < 5)
        self.addNewFruit();
      return fruitsMissed;

    }
    let fruitsMissed = animateFruits(this);

    // Handle animations for drops
    function animateDrops(self) {
      // Remove drops with r <= 0 by reverse traversing
      let drops = self.getAll('drops');
      for(let drop of drops) {
        if(drop.height > 0) {
          // Move drops while decreasing size
          let details = drop.details;
          details.x += details.vx;
          details.y += details.vy;
          details.radius -= 1;
          //details.visible = (Math.floor(Math.random()*2) == 0);
          self.add('drops', self.getNewDrop(details));

          /*drop.radius -= 1;*/
        }
        self.remove('drops', drop.name);
      }
    }
    animateDrops(this);

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

    this.score += noFruitCuts;
    this.missed += fruitsMissed;

    this.animateScoreBoard();
  }

  animateScoreBoard() {
    let score = this.score;
    let chars = [];

    while(score > 0) {
      chars.unshift(score % 10);
      score = Math.floor(score/10);
    }
    if(chars.length == 1)
      chars.unshift(0);
    if(chars.length == 0)
      chars = [0, 0]

    let x = 80;
    let y = 50;

    this.remove('scoreContainer');
    for(let char of chars) {
      let gr = new PIXI.Sprite(PIXI.Texture.fromFrame(`num${char}.png`));
      gr.width = 40;
      gr.height = 50;
      gr.x = x;
      gr.y = y;
      x += 50;
      this.add('scoreContainer', gr);
    }

    if(this.mode == "archade mode")
      this.animateArchadeMode();
    else if(this.mode == "zen mode")
      this.animateZenMode();
  }

  animateArchadeMode() {
    let seconds = 60 - Math.floor((+new Date - this.timestart)/1000);
    if(seconds < 0) return;
    let mins = Math.floor(seconds/60);
    let secs = seconds % 60;
    secs = [Math.floor(secs/10), secs%10];

    let score = [mins, "10", ...secs]; // "10" is for ':'
    let x = Config.ww - 250;
    let y = 70;
    this.remove('timeContainer');

    for(let s of score) {
      let gr = new PIXI.Sprite(PIXI.Texture.fromFrame(`num${s}.png`));
      gr.x = x;
      gr.y = y;
      gr.width = 40;
      gr.height = 50;

      x += 50;

      this.add('timeContainer', gr);
    }
  }

  animateZenMode() {
    let cross = [];
    for(let i=0; i < this.missed && i < 3; i++) {
      cross.push('r'); // red cross
    }
    while(cross.length < 3)
      cross.push('b');

    let x = Config.ww - 250;
    let y = 100;
    this.remove('crossContainer');
    for(let c of cross) {
      let cr = new PIXI.Sprite(PIXI.Texture.fromFrame(`${c}cross.png`));
      cr.x = x;
      cr.y = y;
      cr.width = 30;
      cr.height = 30;

      x += 40;

      this.add('crossContainer', cr);
    }
  }

  getNewDrop(details) {
    const drop = new PIXI.Graphics();
    drop.lineStyle(2, details.color);
    drop.beginFill(details.color, 1);
    drop.drawCircle(details.x, details.y, details.radius);
    drop.endFill();
    drop.vx = details.vx; drop.vy = details.vy;
    //drop.visible = details.visible;
    drop.details = details;
    return drop;
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
          color: mapping.dropColor,
          //visibleID: (Math.floor(Math.random()*2) == 0)
        };
        self.add('drops', self.getNewDrop(details));
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
      if(!checkIfIntersection(mouseData, fruit.getBounds()))
        continue

      noFruitCuts += 1;
      // Fruit cut successfull: Add splas, drops and remove fruit
      initializeDrops(this, fruit);
      initializeSplash(this, fruit);
      initializeCutFruit(this, fruit);
      this.remove('fruits', fruit.name);
    }
    return noFruitCuts;
  }

  resize() {

  }

// End class
}

