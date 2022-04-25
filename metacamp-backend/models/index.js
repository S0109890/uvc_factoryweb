const Sequelize = require('sequelize')
const User = require('./user')
const Department = require('./department')
const Device = require('./device')

const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize;

db.User = User
db.Department = Department
db.Device = Device

User.init(sequelize)
Department.init(sequelize)
Device.init(sequelize)

User.associate(db)
Department.associate(db)
Device.associate(db)

module.exports = db;
