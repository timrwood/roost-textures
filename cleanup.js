const fs = require('fs')
const path = require('path')
const underscored = require('underscore.string/underscored')

fs
  .readdirSync('./src/entities')
  .filter(f => path.extname(f) === '.png')
  .forEach(fileName => {
    const dstFileName = underscored(fileName).replace(/_?chick(en)?s?_?/, '')
    fs.renameSync(`./src/entities/${fileName}`, `./src/entities/${dstFileName}`)
  })
