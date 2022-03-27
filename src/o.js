let [id] = process.argv.splice(2)

const exec = require('child_process').exec

exec(`open ../_raw/${Math.floor(id / 100)}/${id}.json`)
