/*
 * @Author: czy0729
 * @Date: 2021-04-25 18:19:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-13 04:57:45
 */
const fs = require('fs')
const axios = require('axios')

require('events').EventEmitter.defaultMaxListeners = 0
axios.defaults.timeout = 3000

const accessToken = {
  access_token: '4e8826ba0a3496fa9468ff272fa8e05283304930',
  expires_in: 604800,
  token_type: 'Bearer',
  scope: null,
  user_id: 456208,
  refresh_token: 'b0517c280758e892952c95e56bbff54c9afb4ca2'
}
const startIndex = 0
const game = JSON.parse(fs.readFileSync('../data/game.min.json'))

const min = []
;(async function () {
  for (let i = game.length - 22; i < game.length; i += 1) {
    const item = game[i]
    const idBgm = item.id

    const url = `https://api.bgm.tv/v0/subjects/${item.id}`
    const data = await request(url)
    item.c = sImg(data)
    if (data.rating.score) item.sc = data.rating.score
    if (data.rating.rank) item.r = data.rating.rank
    min.push(item)

    if (i % 20 === 0) {
      fs.writeFileSync('../data/game.min.json', JSON.stringify(min, null, 2))
      console.log('write', `${i} / ${game.length}`)
    }
    console.log(`[${item.id}]`, data.name_cn, item.sc, item.r)
  }
})()

function sImg(item, type = 'medium') {
  return ((item.images && item.images[type]) || '')
    .replace('http://lain.bgm.tv/', '//lain.bgm.tv/')
    .replace('https://lain.bgm.tv/', '//lain.bgm.tv/')
    .split('?')[0]
    .replace('//lain.bgm.tv/pic/cover/', '')
    .replace('.jpg', '')
}

/**
 * 接口某些字段为空返回null, 影响到es6函数初始值的正常使用, 统一处理成空字符串
 * @param {*} data
 * @url https://jsperf.com/moved-null-2
 */
function safe(data) {
  if (data instanceof Object) {
    Object.keys(data).forEach(k => (data[k] = safe(data[k])))
  }
  return data === null ? '' : data
}

async function request(url) {
  axios.defaults.withCredentials = false

  try {
    const { data } = await axios({
      method: 'get',
      url: `${url}?app_id=bgm8885c4d524cd61fc`,
      headers: {
        Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
        'User-Agent':
          'Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Build/SKQ1.211006.001) 1661803607'
      }
    })
    return safe(data)
  } catch (ex) {
    console.log(ex)
    return request(url)
  }
}
