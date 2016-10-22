import PIXI from 'pixi.js';

export class FruitsContainer extends PIXI.Container {

  constructor(...args) {
    super(...args);
    this.loadTextures();
  }

  assetsLoaded() {
    let specials = ['bomb', 'double', 'flenzy', 'freeze'];
    let fruitTextures = {};
    for(let i=0; i<10; i++)
      fruitTextures[i] = PIXI.Texture.fromFrame(`${i}.png`);

    specials.forEach((e) => {
      fruitTextures[e] = PIXI.Texture.fromFrame(`${e}.png`);
    });
    this.fruitTextures = fruitTextures;
  }

  loadTextures() {
    PIXI.loader
      .add('assets/fruits.json')
      .load(() => {
        let self = this;
        self.assetsLoaded();
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
      let w = window.innerWidth;
      let x = Math.random()*w;
      let y = window.innerHeight;
      let vx = Math.max(1, Math.random()*8);
      let vy = -15;
      let width = 80;
      let height = 80;
      if(x > w/2) vx = -vx;
      return {x, y, vx, vy, width, height};
    }

    let details = intializeDetails();
    // Randomly select a new fruit
    let id = Math.floor(Math.random()*10);
    let fruit = new PIXI.Sprite(this.fruitTextures[id]);
    Object.assign(fruit, details, {id});
    this.addChild(fruit);
  }

  animate() {
    if(this.parent.pause) return;
    // Images not loaded
    if(this.fruitTextures == undefined) return;
    let count = 0;
    let remove = [];
    this.children.forEach((fruit) => {
      let acc = 0.2; // per frame
      fruit.x += fruit.vx;
      fruit.y += fruit.vy;
      fruit.vy += acc;

      if (fruit.y > window.innerHeight)
        this.removeChild(fruit)

      count++;
    })

    if (count < 10) {
      this.addNewFruit();
    }
  }

}

