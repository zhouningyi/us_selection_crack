const getSQL = require('./sql')
const pg = require('pg')
const cfg = [{name: 'podesta', groupCount: 300, groupBySite: 1}, {name: 'dns', groupCount: 431, groupBySite: 1}]

var client = new pg.Client();

const runjob = () => cfg.forEach((d) => {
  client.query('SELECT 1', (e, res) => {
    if(e) console.log(e)
    print(`任务${d.name} ok...`)
  })
  // print(`任务${d.name} start...`)
  // client.query(getSQL(d), (e, res) => {
  //   print(`任务${d.name} ok...`)
  // })
})

const print = console.log
let dbcfg = require('./dbconfig1')
new pg.Pool(dbcfg)
.connect((e) => {
  if(e) return console.error('数据库连接有误..');
  runjob()
});