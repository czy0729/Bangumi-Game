/*
 * @Author: czy0729
 * @Date: 2021-04-15 20:52:02
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-03-27 07:08:32
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join

const filePaths = []
function findJsonFile(path) {
  fs.readdirSync(path).forEach((item, index) => {
    const fPath = join(path, item)
    const stat = fs.statSync(fPath)
    if (stat.isDirectory() === true) {
      findJsonFile(fPath)
    }
    if (stat.isFile() === true && !fPath.includes('.DS_Store')) {
      filePaths.push(fPath)
    }
  })
}

findJsonFile('../raw')

const data = {}
filePaths.forEach(item => {
  const raw = JSON.parse(fs.readFileSync(item))

  delete raw.desc
  data[raw.id] = raw
})

fs.writeFileSync('../data/game.json', JSON.stringify(data, null, 2))

const dataMin = {}
Object.keys(data).forEach(key => {
  const item = data[key]
  const min = {
    t: item.title,
    l: Number(item.length) || 0
  }
  if (item.sub) min.s = item.sub
  if (item.score) min.vs = Number(item.score)
  if (item.count) min.vc = Number(item.count)
  if (item.tags && item.tags.length)
    min.ta = item.tags.filter(item => item !== 'GALGAME')
  if (item.lang && item.lang.length) min.la = item.lang
  if (item.dev && item.dev.length) min.d = item.dev
  if (item.pub && item.pub.length) min.p = item.pub
  if (item.platform && item.platform.length) {
    min.pl = {}

    // 获取最早发售和中文发售
    if (typeof item.date === 'string') {
      min.en = matchDate(item.date)
    } else {
      let date = item.date[item.date.length - 1]
      if (typeof date === 'string') {
        date = [date]
      }

      if (Array.isArray(date)) {
        if (date[1]) min.cn = matchDate(date[1])
        if (date[0]) min.en = matchDate(date[0])
      }
    }

    min.pl = item.platform.map(item => item.label)
  }

  dataMin[item.id] = min
})

const min = Object.keys(dataMin).map(id => ({
  ...dataMin[id],
  id: Number(id)
}))
fs.writeFileSync('../data/game.min.json', JSON.stringify(min))

function matchDate(str) {
  if (typeof str === 'string') {
    const matchs = str.match(/\d+-\d+-\d+/g)
    if (matchs) {
      return matchs[0]
    }
  }

  return ''
}
