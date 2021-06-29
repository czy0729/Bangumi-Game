/*
 * @Author: czy0729
 * @Date: 2021-04-25 18:19:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 17:16:15
 */
const fs = require('fs')
const axios = require('axios')

require('events').EventEmitter.defaultMaxListeners = 0
axios.defaults.timeout = 3000

// navigator.userAgent
// document.cookie
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  Cookie:
    'chii_sec_id=pG5Jgrb5v3PhSnN%2B9S%2Bj0sTJQGDkbMC5jU2SCGE; chii_cookietime=2592000; chii_auth=R9y48ZHF7gIUz1QeDAE46QjJhhT7vXSF7qC5pWVfmO%2FLRZHngfgq4Rz4%2B8wy09ccB6nJRgJ6Q3B3e9wTlTtXcFIQFeNOostp5mBz; prg_display_mode=normal; chii_theme=dark; __utmz=1.1624665203.228.8.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; __utmc=1; chii_sid=6ZepT9; __utma=1.1636245540.1617210056.1624951893.1624957825.236; __utmt=1; __utmb=1.1.10.1624957825'
}
const startIndex = 0
const game = JSON.parse(fs.readFileSync('./data/game.min.json'))

const min = []
;(async function () {
  for (let i = startIndex; i < game.length; i += 1) {
    const item = game[i]
    const idBgm = item.id

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
    .replace('//lain.bgm.tv/pic/cover/', '')
    .replace('.jpg', '')
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
