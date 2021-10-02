/*
 * @Author: czy0729
 * @Date: 2021-04-25 18:19:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-10-02 16:08:20
 */
const fs = require('fs')
const axios = require('axios')

require('events').EventEmitter.defaultMaxListeners = 0
axios.defaults.timeout = 3000

// navigator.userAgent
// document.cookie
const headers = {
  'User-Agent':
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
  Cookie:
  'chii_sec_id=gKB4FVqYg8LPoxJJctmSAsCl5PZ8bR5Vs%2BGdgLWE; chii_cookietime=2592000; chii_theme_choose=1; __utmz=1.1629511442.303.15.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_theme=dark; prg_display_mode=normal; chii_auth=Pjv8PqFeL6oDyU5pd7lYbrfsvk%2BsL6SSGqvL0TcDKdRQudc4DPYSBe7jfKHzB6xV0EWarCJgWMhheUpklA%2FDNlYmXts%2BZKf4tWwJ; __utmc=1; chii_searchDateLine=0; chii_sid=rM6MTv; __utma=1.859723941.1616215584.1633149077.1633161455.370; __utmt=1; __utmb=1.4.10.1633161455'
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
