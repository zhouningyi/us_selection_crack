const sqls = require('./sql')
const Sequelize = require('sequelize')
const getJsonSQLNode = sqls.nodesJson
const getJsonSQLLink = sqls.linksJson
const path = require('path')
const fs = require('fs')
let mkdirp = require('mkdirp');

let dbcfg = require('./dbconfig1')
const sequelize = new Sequelize(dbcfg.database, dbcfg.user, dbcfg.password, {
  host: dbcfg.host,
  port: dbcfg.port,
  maxConcurrentQueries: 100, //最大连接数
  dialect: 'postgres',
  pool: {
    maxConnections: 30,
    maxIdleTime: 30
  }
});

const SAVE_DIR = path.join(__dirname, './../data')
const checkDir = (next) => {
  if (fs.existsSync(SAVE_DIR)) return next()
  mkdirp(SAVE_DIR, next)
}

const runSQL = (d) => {
  sequelize.query(getJsonSQLNode(d)).then((ds) => save(ds, 'node', d.name))
  sequelize.query(getJsonSQLLink(d)).then((ds) => save(ds, 'link', d.name))
}

const save = (ds, type, name) => {
  const content = JSON.stringify(ds[0], null, 2)
  name = `${name}_${type}`
  let dir = path.join(SAVE_DIR, `${name}.json`)
  fs.writeFileSync(dir, content, 'utf8')
  console.log(`${name}写入文件...`)
}
//
const tasks = [{
  name: 'podestas'
}, {
  name: 'dncs'
}]

const run = () => tasks.forEach(runSQL)

checkDir(run)


