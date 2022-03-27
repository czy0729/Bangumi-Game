/*
 * @Author: czy0729
 * @Date: 2021-05-05 03:14:07
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-03-27 08:00:25
 */
const fs = require('fs')

const game = JSON.parse(fs.readFileSync('../data/game.min.json'))

fs.writeFileSync('../data/game.min.json', JSON.stringify(game))
