const getSQL = require('./sql')
const Sequelize = require('sequelize')

let dbcfg = require('./dbconfig1')
const sequelize =  new Sequelize(dbcfg.database, dbcfg.user, dbcfg.password, {
  host: dbcfg.host,
  port: dbcfg.port,
  maxConcurrentQueries: 100, //最大连接数
  dialect: 'postgres',
  pool: {
    maxConnections: 30,
    maxIdleTime: 30
  }
});


const runSQL = (sql, name) => {
  sequelize.query(sql).then((e, d) => console.log(`${name}执行完毕...`))
}
const createTable = (d) => {
  runSQL(getSQL(d), d.name)
}

[{
  name: 'podestas',
  groupCount: 300,
  groupBySite: true
}, {
  name: 'dncs',
  groupCount: 431,
  groupBySite: true
}, {
  name: 'hillaries',
  groupCount: 431,
  groupBySite: false
}]
.forEach(createTable)