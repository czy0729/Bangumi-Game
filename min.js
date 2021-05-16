/*
 * @Author: czy0729
 * @Date: 2021-05-05 03:14:07
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-05 16:42:27
 */
const fs = require('fs')

const raw = JSON.parse(fs.readFileSync('./data/game.json'))
const game = JSON.parse(fs.readFileSync('./data/game.min.json'))

game.forEach(item => {
  const vid = raw[item.id].vid
  if (vid) item.v = Number(vid)
})

fs.writeFileSync('./data/game.min.json', JSON.stringify(game))
