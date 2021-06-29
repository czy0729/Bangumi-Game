/*
 * @Author: czy0729
 * @Date: 2021-05-05 03:14:07
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 18:06:00
 */
const fs = require('fs')

const game = JSON.parse(fs.readFileSync('./data/game.min.json'))

fs.writeFileSync('./data/game.min.json', JSON.stringify(game))
