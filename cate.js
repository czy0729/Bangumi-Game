/*
 * @Author: czy0729
 * @Date: 2021-05-09 14:03:50
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-25 18:09:49
 */
const fs = require('fs')
const game = JSON.parse(fs.readFileSync('./data/game.min.json'))

let map = {}

// 平台
map = {}
game.forEach(item => {
  if (item.pl) {
    item.pl.forEach(i => {
      if (map[i]) {
        map[i] += 1
      } else {
        map[i] = 1
      }
    })
  }
})

const platform = Object.keys(map).sort((a, b) => map[b] - map[a])

// 类型
map = {}
game.forEach(item => {
  if (item.ta) {
    item.ta.forEach(i => {
      if (map[i]) {
        map[i] += 1
      } else {
        map[i] = 1
      }
    })
  }
})

const cate = Object.keys(map).sort((a, b) => map[b] - map[a])

// 开发商
map = {}
game.forEach(item => {
  if (item.d) {
    item.d.forEach(i => {
      if (map[i]) {
        map[i] += 1
      } else {
        map[i] = 1
      }
    })
  }
})

const dev = Object.keys(map).sort((a, b) => map[b] - map[a])

// 开发商ADV
map = {}
game.forEach(item => {
  if (item.ta && item.ta.includes('ADV')) {
    if (item.d) {
      item.d.forEach(i => {
        if (map[i]) {
          map[i] += 1
        } else {
          map[i] = 1
        }
      })
    }
  }
})

const devADV = Object.keys(map).sort((a, b) => map[b] - map[a])

// 发行商
map = {}
game.forEach(item => {
  if (item.p) {
    item.p.forEach(i => {
      if (map[i]) {
        map[i] += 1
      } else {
        map[i] = 1
      }
    })
  }
})

const pub = Object.keys(map).sort((a, b) => map[b] - map[a])

fs.writeFileSync(
  './data/cate.json',
  JSON.stringify({
    platform,
    cate,
    dev,
    devADV,
    pub
  })
)
