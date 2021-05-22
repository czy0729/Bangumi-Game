/*
 * @Author: czy0729
 * @Date: 2021-03-23 16:54:18
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-17 17:38:22
 */
const fs = require('fs')
const http = require('http')
const path = require('path')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const exec = require('child_process').exec

let [tid, id, vid = ''] = process.argv.splice(2)
let length
bgm = id
tid = tid.replace('https://game.tgbus.com/game/', '')
id = id.replace('https://bgm.tv/subject/', '')
vid = vid.replace(/https:\/\/www\.vgtime\.com\/game\/|\.jhtml/g, '')

axios.defaults.timeout = 3000
;(async function () {
  const html = await fetch(`https://game.tgbus.com/game/${tid}`)
  const $ = cheerio(html)

  // 缩略图
  const imgs =
    $('.vd-gallery_preview-item img')
      .map((index, element) => {
        const $row = cheerio(element)
        const url = $row.attr('src')
        return url.replace('https://', 'http://')
        // return `http://img2.tgbus.com/i/gl_1080p/_raw/sharedata/${
        //   url.split('/sharedata/')[1]
        // }`
      })
      .get() || []
  if (imgs.length) {
    for (let i = 0; i < imgs.length; i += 1) {
      const url = imgs[i]
      await download(
        url,
        `./_preview/${Math.floor(id / 100)}/${id}/${i + 1}.jpg`
      )
    }
  }

  if (!vid) {
    console.log(bgm, imgs.length)
    exec(`open ./_preview/${Math.floor(id / 100)}/${id}/`)
  } else {
    length = imgs.length
  }

  async function fetch(url) {
    try {
      const { data } = await axios({
        url,
        headers: {
          Referer: 'https://game.tgbus.com/',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko)'
        }
      })
      return data
    } catch (error) {
      return fetch(url, headers)
    }
  }

  function cheerio(target) {
    if (typeof target === 'string') {
      return cheerioRN.load(target)
    }
    return cheerioRN(target)
  }

  async function download(url, pathData) {
    return new Promise((resolve, reject) => {
      // if (fs.existsSync(pathData)) {
      //   console.log(`- skip ${pathData}`)
      //   return resolve(true)
      // }

      http.get(
        url,
        {
          headers: {
            Referer: 'https://game.tgbus.com/'
          }
        },
        (req, res) => {
          let imgData = ''
          req.setEncoding('binary')
          req.on('data', chunk => (imgData += chunk))
          req.on('end', () => {
            const dirPath = path.dirname(pathData)
            if (!fs.existsSync(dirPath)) {
              const rootPath = path.join(dirPath, '..')
              if (!fs.existsSync(rootPath)) {
                fs.mkdirSync(rootPath)
              }

              fs.mkdirSync(dirPath)
            }

            console.log(`- write ${url}`)
            fs.writeFileSync(pathData, imgData, 'binary', err => {
              if (err) console.log('- error ${pathData}')
            })

            resolve(true)
          })
        }
      )
    })
  }

  if (vid) {
    ;(async function () {
      const html = await fetch(`http://www.vgtime.com/game/${vid}.jhtml`)
      const $ = cheerio(html)

      // 缩略图
      const imgs = [
        $('.game_info_box img')
          .attr('data-url')
          .replace(',m_lfit,w_300', ',m_pad,color_000000,w_1050,h_660')
      ]

      console.log('length', length)
      if (!length) {
        imgs.push(
          ...(
            $('.game_focus_list img')
              .map((index, element) => {
                const $row = cheerio(element)
                return $row.attr('src').replace(',w_104,h_59', ',w_1050,h_660')
              })
              .get() || []
          )
            .filter(item => !item.includes('noimage_vg.png'))
            .filter((item, index) => index < 12)
        )
      }

      if (imgs.length) {
        for (let i = 0; i < imgs.length; i += 1) {
          const url = imgs[i]
          await download(
            url,
            `./_preview/${Math.floor(id / 100)}/${id}/${i}.jpg`
          )
        }
      }

      let platform =
        $('.platform_detail_box .platform_detail')
          .map((i, el) => {
            const $row = $(el)
            return {
              label: $row.text().trim(),
              cn: $row.attr('data-cn') === 'true'
            }
          })
          .get() || []
      if (!platform.length) {
        platform =
          $('.jizhong_tab span')
            .map((i, el) => {
              const $row = $(el)
              return {
                label: $row.text().trim(),
                cn: $row.attr('data-cn') === 'true'
              }
            })
            .get() || []
      }

      let date = (
        $('.plat_date_detail')
          .map((i, el) => {
            const $row = $(el)
            return $row.text().trim()
          })
          .get() || []
      ).map(item => item.split('\n'))

      // 详细信息
      const data = {
        id,
        vid,
        title: $('.game_box > h2 > a').text().trim(),
        sub: $('.game_box > p').text().trim(),
        length: length || imgs.length,
        score: Number($('.game_score').text().trim()),
        count: Number(
          $('.game_count').text().trim().replace(' 位玩家评分', '')
        ),
        platform,
        date,
        tags:
          $('.descri_box .game_gene span')
            .map((i, el) => {
              const $row = $(el)
              return $row.text().trim()
            })
            .get() || []
      }

      $('.game_box_list').each((i, el) => {
        const $row = $(el)
        const label = $row.find('.vg_tit h2').text().trim()
        if (label === '关于游戏') {
          data.desc = $row.find('.game_description').text().trim()
        }
      })

      $('.descri_box').each((i, el) => {
        const $row = $(el)
        const label = $row.find('p').text().trim()
        if (label === '语言') {
          data.lang = $row.find('span').text().trim().split('\n')
        } else if (label === '开发商') {
          data.dev = $row.text().trim().replace('开发商\n', '').split('\n')
        } else if (label === '发行商') {
          data.pub = $row.text().trim().replace('发行商\n', '').split('\n')
        }

        if (!data.date.length) {
          if (label === '最早发售') {
            data.date.push($row.text().trim().replace('\n', ' '))
          }
        }
      })

      const dataPath = `./_raw/${Math.floor(id / 100)}/${id}.json`
      const dirPath = path.dirname(dataPath)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }
      fs.writeFileSync(
        `./_raw/${Math.floor(id / 100)}/${id}.json`,
        JSON.stringify(data)
      )
      console.log(data)

      exec(`open ./_preview/${Math.floor(id / 100)}/${id}/`)
    })()

    async function fetch(url) {
      const { data } = await axios({
        url,
        headers: {
          referer: 'http://www.vgtime.com/',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
        }
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
        if (fs.existsSync(pathData)) {
          console.log(`- skip ${pathData}`)
          return resolve(true)
        }

        const dirPath = path.dirname(pathData)
        if (!fs.existsSync(dirPath)) {
          const rootPath = path.join(dirPath, '..')
          if (!fs.existsSync(rootPath)) {
            fs.mkdirSync(rootPath)
          }
          fs.mkdirSync(dirPath)
        }

        const writer = fs.createWriteStream(pathData)
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
          headers: {
            referer: 'http://www.vgtime.com/'
          }
        })

        response.data.pipe(writer)
        writer.on('finish', () => {
          console.log(url)
          resolve()
        })
      })
    }
  }
})()
