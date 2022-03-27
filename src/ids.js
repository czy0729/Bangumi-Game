/*
 * @Author: czy0729
 * @Date: 2021-05-14 21:58:19
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-03-27 08:04:25
 */
const fs = require('fs')

const game = JSON.parse(fs.readFileSync('../data/game.json'))

const ids = Object.keys(game)
  .map(item => Number(item))
  .sort((a, b) => a - b)

fs.writeFileSync('../data/ids.json', JSON.stringify(ids))
