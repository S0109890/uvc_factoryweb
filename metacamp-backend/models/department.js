const Sequelize = require('sequelize')

module.exports = class Department extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      name: {
        type: Sequelize.STRING(50)
      },
      code: {
        type: Sequelize.STRING(50)
      },
      description: {
        type: Sequelize.TEXT
      }
    }, {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci'
    })
  }
  static associate(db) {
    db.Department.hasMany(db.User, {
      foreignKey: { name: 'departmentId', onDelete: 'SET NULL' }
    })
    db.Department.hasMany(db.Device, {
      foreignKey: { name: 'departmentId', onDelete: 'SET NULL'}
    })
  }
}