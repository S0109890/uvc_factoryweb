const express = require('express')
const Department = require('../models/department')

const router = express.Router()

router.route('/')
  .get(async (req, res, next) => {
    try {
      const department = await Department.findAll() 
      res.json(department)
    } catch(err) {
      console.error(err)
      next(err)
    }
  })
  .post(async (req, res, next) => {
    try {
      const {name, code, description} = req.body
      const department = await Department.create({
        name,
        code,
        description
      })
      res.status(201).json(department)
    } catch(err) {
      console.error(err)
      next(err)
    }
  })
  
  router.route('/:id')
    .get(async (req, res, next) => {
      try {
        const department = await Department.findByPk(req.params.id)
        res.json(department)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })
    .put(async (req, res, next) => {
      try {
        const {name, code, description} = req.body
        const result = await Department.update({
          name,
          code,
          description
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
        const result = await Department.destroy({where: {id: req.params.id}})
        res.json(result)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })

  module.exports = router

