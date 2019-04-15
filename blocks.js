const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG
const underscored = require('underscore.string/underscored')
const { blit0, blit90, blit180, blit270 } = require('./blit')

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

  copyFront() {
    let { srcPng, dstPng } = this
    blit0(srcPng, dstPng, 6, 10, 6, 5, 1, 11) // body
    blit0(srcPng, dstPng, 30, 19, 1, 4, 0, 11) // wing left
    blit0(srcPng, dstPng, 30, 19, 1, 4, 7, 11) // wing right
    blit0(srcPng, dstPng, 3, 3, 4, 6, 2, 7) // face
    blit0(srcPng, dstPng, 16, 2, 4, 2, 2, 9) // beak
    blit0(srcPng, dstPng, 16, 6, 2, 2, 3, 11) // chin
  }

  copySide() {
    let { srcPng, dstPng } = this
    blit0(srcPng, dstPng, 7, 3, 3, 6, 7, 0) // face
    blit270(srcPng, dstPng, 12, 15, 5, 7, 9, 4) // body
    blit0(srcPng, dstPng, 24, 19, 6, 4, 10, 0) // wing
    blit0(srcPng, dstPng, 20, 2, 2, 2, 5, 2) // beak
    blit0(srcPng, dstPng, 18, 6, 1, 2, 6, 4) // chin
  }

  copyTop() {
    let { srcPng, dstPng } = this
    blit0(srcPng, dstPng, 3, 0, 4, 3, 0, 0) // face
    blit0(srcPng, dstPng, 16, 0, 4, 2, 0, 3) // beak
    blit0(srcPng, dstPng, 6, 15, 6, 7, 9, 9) // body
    blit0(srcPng, dstPng, 30, 13, 1, 6, 8, 10) // wing left
    blit0(srcPng, dstPng, 30, 13, 1, 6, 15, 10) // wing right
  }

  save() {
    let data = PNG.sync.write(this.dstPng)
    fs.writeFileSync(
      `../roost/src/main/resources/assets/roost/textures/blocks/chicken/${this.dstFileName}`,
      data
    )
  }

  process() {
    this.clear()
    this.copyFront()
    this.copyTop()
    this.copySide()
    this.save()
  }
}

const images = fs
  .readdirSync('./src/entities')
  .filter(f => path.extname(f) === '.png')
  .map(f => new Image(f))

images.sort((a, b) => (a.key > b.key ? 1 : -1))

images.forEach(image => image.process())

function saveRoostBlockJSON() {
  const chickenVariants = { empty: { model: 'roost:roost' } }
  images.forEach(image => {
    chickenVariants[image.key] = {
      textures: {
        chicken: `roost:blocks/chicken/${image.key}`
      }
    }
  })

  const roostPath = '../roost/src/main/resources/assets/roost/blockstates/roost.json'
  const roostJSON = require(roostPath)
  roostJSON.variants.chicken = chickenVariants

  fs.writeFileSync(roostPath, JSON.stringify(roostJSON, null, null))
}

saveRoostBlockJSON()
