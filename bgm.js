/*
 * @Author: czy0729
 * @Date: 2021-04-25 18:19:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-09 23:50:43
 */
const fs = require('fs')
const axios = require('axios')

require('events').EventEmitter.defaultMaxListeners = 0
axios.defaults.timeout = 3000

// navigator.userAgent
// document.cookie
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
  Cookie:
    'chii_sec_id=pG5Jgrb5v3PhSnN%2B9S%2Bj0sTJQGDkbMC5jU2SCGE; chii_theme=dark; chii_cookietime=2592000; chii_auth=3zmNYVun%2B96yPwv0D%2BE7hRwgZpwz0wKNCE659a2mPuEArWOynIrVafAaXhsdeV%2BRs8uKp19QQK4YDsjxKSxFIyFGHDtxuAtaw3hF; prg_display_mode=normal; __utmz=1.1620316056.95.3.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_sid=43z2aa; __utma=1.1636245540.1617210056.1620491715.1620567471.102; __utmc=1; __utmt=1; __utmb=1.1.10.1620567471'
}
const startIndex = 400
const game = JSON.parse(fs.readFileSync('./data/mini.json'))
const ids = Object.keys(game)

if (startIndex) {
  const min = JSON.parse(fs.readFileSync('./data/game.min.json'))
  Object.keys(game).forEach(item => {
    if (min[item]) {
      game[item].c = min[item].c
    }
  })
}

const min = []
;(async function () {
  for (let i = startIndex; i < ids.length; i += 1) {
    const idBgm = ids[i]
    const item = game[idBgm]
    item.id = Number(idBgm)

    const url = `https://api.bgm.tv/subject/${item.id}?responseGroup=large`
    console.log('fetch', url)
    const data = await fetch(url)

    item.c = smallImage(data)
    if (data.rating && data.rating.score) {
      item.sc = data.rating.score
    }
    if (data.rank) {
      item.r = data.rank
    }
    min.push(item)

    if (i % 20 === 0) {
      fs.writeFileSync('./data/game.min.json', JSON.stringify(min, null, 2))
      console.log('write', i)
    }
  }
})()

function smallImage(item, type = 'medium') {
  return ((item.images && item.images[type]) || '')
    .replace('http://lain.bgm.tv/', '//lain.bgm.tv/')
    .replace('https://lain.bgm.tv/', '//lain.bgm.tv/')
    .split('?')[0]
}

async function fetch(url, headers) {
  try {
    const { data } = await axios({
      url,
      headers
    })
    return data
  } catch (error) {
    console.log(error)
    return fetch(url, headers)
  }
}
