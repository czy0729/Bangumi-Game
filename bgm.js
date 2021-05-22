/*
 * @Author: czy0729
 * @Date: 2021-04-25 18:19:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-17 17:27:38
 */
const fs = require('fs')
const axios = require('axios')

require('events').EventEmitter.defaultMaxListeners = 0
axios.defaults.timeout = 3000

// navigator.userAgent
// document.cookie
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
  Cookie:
    'chii_sec_id=gKB4FVqYg8LPoxJJctmSAsCl5PZ8bR5Vs%2BGdgLWE; chii_cookietime=2592000; chii_theme_choose=1; chii_theme=dark; chii_auth=ayzByt8yYpFTz1wAk9dKpUZ0WmvrnKChvSMBmJPkS4ccadkUQweDf0NjJCbgfmAjGS4%2FMK03D4%2BypWrbXi8WkJ5Xd2cydK05CukX; __utmc=1; __utmz=1.1620303079.148.9.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; prg_display_mode=normal; chii_searchDateLine=0; __utma=1.859723941.1616215584.1621231192.1621242665.165; chii_sid=pbKl2p; __utmb=1.11.10.1621242665'
}
const startIndex = 0
const game = JSON.parse(fs.readFileSync('./data/game.min.json'))
const ids = Object.keys(game)

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
