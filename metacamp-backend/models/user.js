const Sequelize = require('sequelize')

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      name: {
        type: Sequelize.STRING(100),
      },
      userid: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(20),
      },
      email: {
        type: Sequelize.STRING(255)
      },
      phone: {
        type: Sequelize.STRING(255)
      },
      updated_pw_date: {
        type: Sequelize.DATE
      },
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
    db.User.belongsTo(db.Department, { foreignKey: { name: 'departmentId', onDelete: 'SET NULL' }})
    db.User.hasMany(db.Device, {
      foreignKey: { name: 'userId', onDelete: 'SET NULL' }
    })
  }
}