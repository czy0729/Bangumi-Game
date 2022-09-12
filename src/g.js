/*
 * @Author: czy0729
 * @Date: 2021-05-19 09:43:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-13 03:51:43
 */
const cheerioRN = require('cheerio-without-node-native')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

axios.defaults.timeout = 9000

const access = {
  tourist: 1,
  accessToken: {
    access_token: '4e8826ba0a3496fa9468ff272fa8e05283304930',
    expires_in: 604800,
    token_type: 'Bearer',
    scope: null,
    user_id: 456208,
    refresh_token: 'b0517c280758e892952c95e56bbff54c9afb4ca2'
  },
  userCookie: {
    cookie:
      'chii_sid=QhpvAQ; chii_sec_id=ZeYenxsZOyTPbG1wsgcUuj3jr%2FU4DfDvmY%2Bw%2BKE; chii_cookietime=0; chii_auth=PbATzU4RbHfZbzV6sgYHw2aVz79TW9fssfuZzdtyJfWjMV1rzqJgQ5ZUPiaIuZoUvuyWYw1FqI%2BLOog8jGs4%2Bip%2Fs%2FaceBFzFRXW',
    userAgent:
      'Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Build/SKQ1.211006.001) 1661803607',
    v: 0,
    tourist: 0
  }
}

const desc = `

  `.replace(/\n| /g, '')

;(async function () {
  let [a, b] = process.argv.splice(2)
  let [url, id] = a.includes('bgm.tv') ? [b, a] : [a, b]

  id = parseInt(id.replace('https://bgm.tv/subject/', ''))

  let name_cn, name, air_date, dev

  const data = await fetch(
    `https://api.bgm.tv/v0/subjects/${id}?app_id=bgm8885c4d524cd61fc`,
    {
      Authorization: `${access.accessToken.token_type} ${access.accessToken.access_token}`,
      'User-Agent': access.userCookie.userAgent
    }
  )

  name_cn = data.name_cn || data.name || ''
  name = data.name || data.name_cn || ''
  air_date = data.date || '20--'
  
  if (data.infobox && data.infobox.length) {
    const find = data.infobox.find(item => item.key === '开发')
    dev = find && find.value || ''
  }

  const jsonDir = `../_raw/${Math.floor(id / 100)}/${id}.json`
  const jsonDirPath = path.dirname(jsonDir)
  if (!fs.existsSync(jsonDirPath)) {
    fs.mkdirSync(jsonDirPath)
  }

  fs.writeFileSync(
    jsonDir,
    JSON.stringify(
      {
        id,
        title: name_cn,
        sub: name,
        length: 0,
        platform: [{ label: 'PC', cn: false }],
        date: air_date,
        tags: ['ADV', 'GALGAME'],
        desc,
        dev: [dev],
        pub: [dev]
      },
      null,
      2
    )
  )
  console.log(jsonDir)
  // exec(`open ${jsonDir}`)

  let imgDirPath = `../_preview/${Math.floor(id / 100)}`
  if (!fs.existsSync(imgDirPath)) {
    fs.mkdirSync(imgDirPath)
  }

  imgDirPath = `../_preview/${Math.floor(id / 100)}/${id}`
  if (!fs.existsSync(imgDirPath)) {
    fs.mkdirSync(imgDirPath)
  }

  const imgs = []
  const html = await fetch(url)
  const $ = cheerio(html)

  if (url.includes('bilibili.com')) {
    const banner = html.match(/banner_url: "(.+?)",/)
    if (banner) {
      imgs.push(banner[1])
    }
    $('.article-holder img').each((index, element) => {
      const $row = cheerio(element)
      imgs.push(`https:${$row.attr('data-src')}`)
    })
  } else if (url.includes('vndb.org')) {
    $('.scr .scrlnk').each((index, element) => {
      const $row = cheerio(element)
      imgs.push($row.attr('href'))
    })
  }

  if (imgs.length) {
    // exec(`open ${imgDirPath}`)
    for (let i = 0; i < imgs.length; i += 1) {
      const url = imgs[i]
      const savePath = `${imgDirPath}/_${i}.jpg`
      if (!fs.existsSync(savePath)) {
        await download(url, savePath)
      }
    }
  }
})()

async function fetch(url, headers = {}) {
  const { data } = await axios({
    url,
    headers
  })
  return data
}

function cheerio(target) {
  if (typeof target === 'string') {
    return cheerioRN.load(target)
  }
  return cheerioRN(target)
}

async function download(url, pathData) {
  return new Promise(async (resolve, reject) => {
    const writer = fs.createWriteStream(pathData)

    // https://i0.hdslb.com/bfs/article/cdc49de4d04f21cd6957c5a4ffad5b50b0d88547.jpg@1320w_742h.webp
    const isBilibili = url.includes('hdslb.com')
    const response = await axios({
      url: isBilibili ? `${url}@1320w_742h.webp` : url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        referer: isBilibili ? 'http://www.bilibili.com/' : 'https://vndb.org/'
      }
    })

    response.data.pipe(writer)
    writer.on('finish', () => {
      console.log(pathData)
      resolve()
    })
  })
}
