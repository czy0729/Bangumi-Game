/*
 * 挑选一些好的资源, 留给 App 没能获取云端数据时使用
 *
 * @Author: czy0729
 * @Date: 2021-01-06 01:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 18:09:06
 */
const fs = require('fs')

const game = JSON.parse(fs.readFileSync('./data/game.min.json'))

// const eg = [
//   {
//     id: 4,
//     t: '合金弹头7',
//     l: 11,
// x   s: 'Metal Slug 7',
// x   vs: 7.8,
// x   vc: 133,
//     ta: ['动作', '射击'],
// x   d: ['SNK'],
// x   p: ['SNK'],
//     pl: ['PC', 'PSV', 'NDS'],
//     en: '2008-07-17',
// x   cn: '',
//     c: 'm/a8/7f/4_cMMK5',
//     sc: 6.9,
//     r: 3387
//   }
// ]
const app = game
  .filter(item => {
    if (item.en && (item.en.includes('2021-') || item.en.includes('2020-'))) {
      return true
    }

    if (!item.r) return false

    return item.r <= 1000
  })
  .map(item => {
    delete item.s
    delete item.d
    delete item.vs
    delete item.vc
    delete item.p
    delete item.cn
    return item
  })

fs.writeFileSync('./data/game.app.json', JSON.stringify(app))
process.exit()
