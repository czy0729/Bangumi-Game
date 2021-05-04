let [id] = process.argv.splice(2)

const exec = require('child_process').exec

exec(`open ./data/${Math.floor(id / 100)}/${id}.json`)
