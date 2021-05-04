/*
 * @Author: czy0729
 * @Date: 2021-04-25 18:19:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-04 15:50:20
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
    'chii_sec_id=pG5Jgrb5v3PhSnN%2B9S%2Bj0sTJQGDkbMC5jU2SCGE; chii_theme=dark; chii_cookietime=2592000; __utmz=1.1617340376.3.2.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_auth=3zmNYVun%2B96yPwv0D%2BE7hRwgZpwz0wKNCE659a2mPuEArWOynIrVafAaXhsdeV%2BRs8uKp19QQK4YDsjxKSxFIyFGHDtxuAtaw3hF; prg_display_mode=normal; __utmc=1; chii_sid=RrGnOo; __utma=1.1636245540.1617210056.1620111344.1620114099.82; __utmt=1; __utmb=1.1.10.1620114099'
}
const game = JSON.parse(fs.readFileSync('./data/mini.json'))
const ids = Object.keys(game)

const min = []
;(async function () {
  for (let i = 0; i < ids.length; i += 1) {
    const idBgm = ids[i]
    const item = game[idBgm]
    item.id = Number(idBgm)

    const url = `https://api.bgm.tv/subject/${item.id}?responseGroup=large`
    console.log('fetch', url)
    const data = await fetch(url)

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
