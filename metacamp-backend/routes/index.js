const express = require('express')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    res.send("Express-Sequelize 실습 예제!!!!")
  } catch(err) {
    console.error(err)
    next(err)
  }
})

module.exports = router