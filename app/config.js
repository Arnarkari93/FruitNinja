export const Config = {
  'fruit': {
    'size': 80,
    'vx': 5,
    'vy': -10,
  },
  'acc': 0.1,
  'drops': {
  	'rad': 10,
  },
  'halfFruit': {
    'size': 80
  },
  'splash': {
    'size': 150
  },
  'ww': 1301,
  'wh': 654,
};

export const imageMappings = {};

let dropsColor=['rgba(255, 44, 44, 0.9)','rgba(0, 193, 44, 0.9)',
    'rgba(255, 39, 44, 0.9)','rgba(255, 255, 0, 0.9)',
    'rgba(255, 255, 0, 0.9)','rgba(255, 255, 0, 0.9)',
    'rgba(255, 44, 44, 0.9)','rgba(0, 193, 44, 0.9)',
    'rgba(255, 39, 44, 0.9)','rgba(255, 255, 0, 0.9)','',
    'rgba(0,0,255,0.4)','rgba(255, 255, 0, 0.9)','rgba(0,0,255,0.2)'];

imageMappings.numFruits = 10;
for(let i=0; i<imageMappings.numFruits; i++) {
  imageMappings[`fruit${i}`] = {
    'hf1': `halffruit${2*i}`,
    'hf2': `halffruit${2*i+1}`,
    'splash': `splash${i}`,
    'dropColor': dropsColor[i],
  }
}

let specials = ['bomb', 'double', 'flenzy', 'freeze'];

specials.forEach((e, i) => {
  imageMappings[e] = {
    // set mappings of special fruits and bomb here
  }
});