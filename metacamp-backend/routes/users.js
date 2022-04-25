const express = require('express')
const User = require('../models/user')
const Department = require('../models/department')

const router = express.Router()

router.route('/')
  .get(async (req, res, next) => {
    try {
      const user = await User.findAll({
        attributes: { exclude: ['password'] }, // password 제외
        include: [
          {
            model: Department
          }
        ]
      })
      
      res.json(user)
    } catch(err) {
      console.error(err)
      next(err)
    }
  })
  .post(async (req, res, next) => {
    try {
      const {name, userid, password, role, email, phone, departmentId} = req.body
      const user = await User.create({
        name,
        userid,
        password,
        role,
        email,
        phone,
        departmentId
      })
      console.log(user)
      res.status(201).json(user)
    } catch(err) {
      console.error(err)
      next(err)
    }
  })

  router.route('/:id')
    .get(async (req, res, next) => {
      try {
        const result = await User.findByPk(req.params.id)
        res.json(result)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })
    .put(async (req, res, next) => {
      try {
        const {name, userid, role, email, phone, departmentId} = req.body
        const result = await User.update({
          name,
          userid,
          role,
          email,
          phone,
          departmentId
        }, {
          where: { id: req.params.id }
        })
        res.json(result)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })
    .delete(async (req, res, next) => {
      try {
        const result = await User.destroy({where: {id: req.params.id}})
        res.json(result)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })
  module.exports = router

