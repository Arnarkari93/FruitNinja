export const Config = {
  fruit: {
    size: 80,
    vx: 5,
    vy: -10,
  },
  acc: 0.1,
  drops: {
    rad: 25,
  },
  halfFruit: {
    size: 80,
  },
  splash: {
    size: 150,
  },
  ww: 1301,
  wh: 654,
};

export const imageMappings = {};

export const dropsColor = [
  0xff2c2c, 0x00c12c,
  0xff272c, 0xffff00,
  0xff2c2c, 0xffff00,
  0xff2c2c, 0x00c12c,
  0xff272c, 0xffff00,
  '', 0x0000ff,
  0xffff00, 0x0000ff,
];

imageMappings.numFruits = 10;

for (let i = 0; i < imageMappings.numFruits; i += 1) {
  imageMappings[`fruit${i}`] = {
    hf1: `halffruit${2 * i}`,
    hf2: `halffruit${2 * i + 1}`,
    splash: `splash${i}`,
    dropColor: dropsColor[i],
  };
}

const specials = ['bomb', 'double', 'flenzy', 'freeze'];

specials.forEach((e, i) => {
  imageMappings[e] = {
    // set mappings of special fruits and bomb here
  };
});
