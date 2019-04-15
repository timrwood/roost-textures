const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG
const underscored = require('underscore.string/underscored')
const { blit0, blit90, blit180, blit270 } = require('./blit')
const { overlay } = require('./overlay')

const backgroundPng = PNG.sync.read(fs.readFileSync('./src/item-cage-background.png'))
const overlayPng = PNG.sync.read(fs.readFileSync('./src/item-cage-mask.png'))

class Image {
  constructor(fileName) {
    this.srcFileName = fileName
    this.dstFileName = underscored(fileName).replace(/_?chick(en)?s?_?/, '')
    this.key = this.dstFileName.replace('.png', '')
    this.srcData = fs.readFileSync(`./src/entities/${this.srcFileName}`)
    this.srcPng = PNG.sync.read(this.srcData)
    this.dstPng = new PNG({
      width: 16,
      height: 16,
      colorType: 6
    })
  }

  clear() {
    let { width, height, data } = this.dstPng
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let idx = (width * y + x) << 2
        data[idx + 0] = 0
        data[idx + 1] = 0
        data[idx + 2] = 0
        data[idx + 3] = 0
      }
    }
  }

  copyChicken() {
    let { srcPng, dstPng } = this

    overlay(backgroundPng, dstPng)

    // blit180(srcPng, dstPng, 6, 10, 6, 6, 5, 7); // body
    // blit180(srcPng, dstPng, 6, 10, 6, 6, 4, 6); // body
    // blit180(srcPng, dstPng, 6, 10, 6, 6, 6, 6); // body
    blit0(srcPng, dstPng, 6, 10, 6, 6, 5, 6) // body
    // blit0(srcPng, dstPng, 30, 19, 1, 4, 3, 7); // wing left
    blit0(srcPng, dstPng, 30, 19, 1, 4, 4, 7) // wing left
    blit0(srcPng, dstPng, 30, 19, 1, 4, 11, 7) // wing right
    // blit0(srcPng, dstPng, 30, 19, 1, 4, 12, 7); // wing right

    // blit0(srcPng, dstPng, 2, 3, 1, 6, 5, 2); // face
    // blit0(srcPng, dstPng, 7, 3, 1, 6, 10, 2); // face
    // blit0(srcPng, dstPng, 3, 3, 4, 6, 6, 1); // face
    blit0(srcPng, dstPng, 3, 3, 4, 6, 6, 2) // face

    // blit0(srcPng, dstPng, 16, 2, 4, 2, 5, 4); // beak
    // blit0(srcPng, dstPng, 16, 2, 4, 2, 7, 4); // beak
    blit0(srcPng, dstPng, 16, 2, 4, 2, 6, 4) // beak

    blit0(srcPng, dstPng, 16, 6, 2, 2, 7, 6) // chin

    blit0(srcPng, dstPng, 36, 3, 1, 1, 6, 12) // leg left
    blit0(srcPng, dstPng, 36, 3, 1, 1, 9, 12) // leg right

    // blit0(srcPng, dstPng, 32, 2, 3, 1, 4, 13); // foot left
    // blit0(srcPng, dstPng, 32, 2, 3, 1, 5, 14); // foot left
    blit0(srcPng, dstPng, 32, 2, 3, 1, 5, 13) // foot left
    // blit0(srcPng, dstPng, 32, 2, 3, 1, 8, 14); // foot right
    // blit0(srcPng, dstPng, 32, 2, 3, 1, 9, 13); // foot right
    blit0(srcPng, dstPng, 32, 2, 3, 1, 8, 13) // foot right

    overlay(overlayPng, dstPng)
  }

  save() {
    let data = PNG.sync.write(this.dstPng)
    fs.writeFileSync(
      `../roost/src/main/resources/assets/roost/textures/items/chicken/${this.dstFileName}`,
      data
    )
  }

  saveJSON() {
    let json = {
      parent: 'minecraft:item/generated',
      textures: {
        layer0: `roost:items/chicken/${this.key}`
      }
    }
    let data = JSON.stringify(json, null, 2)

    fs.writeFileSync(
      `../roost/src/main/resources/assets/roost/models/item/chicken/${this.key}.json`,
      data
    )
  }

  process() {
    this.clear()
    this.copyChicken()
    this.save()
    this.saveJSON()
  }
}

const images = fs
  .readdirSync('./src/entities')
  .filter(f => path.extname(f) === '.png')
  .map(f => new Image(f))

images.sort((a, b) => (a.key > b.key ? 1 : -1))

function saveChickenItemJSON() {
  const overrides = images.map((image, index) => {
    return {
      predicate: { chicken: (index + 0.5) / 500 },
      model: `roost:item/chicken/${image.key}`
    }
  })

  overrides.unshift({ predicate: { chicken: 0.0 }, model: 'roost:item/chicken/vanilla' })
  overrides.push({
    predicate: { chicken: (images.length + 0.5) / 500 },
    model: 'roost:item/chicken/vanilla'
  })

  const chickenPath = '../roost/src/main/resources/assets/roost/models/item/chicken.json'
  const chickenJSON = require(chickenPath)
  chickenJSON.overrides = overrides

  fs.writeFileSync(chickenPath, JSON.stringify(chickenJSON, null, null))
}

const enums =
  images
    .map((image, index) => {
      return `${image.key.toUpperCase()}("${image.key}", ${((index + 1) / 500).toFixed(3)})`
    })
    .join(',\n') + ';'

saveChickenItemJSON()
images.forEach(image => image.process())

console.log(enums)
