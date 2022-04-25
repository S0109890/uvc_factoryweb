const express = require('express')
const Device = require('../models/device')
const deviceConnectionCheck = require('../middleware/device-connection-check')
const User = require('../models/user')
const Department = require('../models/department')

const router = express.Router()

router.route('/')
  .get(async (req, res, next) => {
    try {
      const Devices = await Device.findAll({
        include: [
          {
            model: Department
          },
          {
            model: User
          }
        ]
      })
      res.json(Devices)
    } catch(err) {
      console.error(err)
      next(err)
    }
  })
  .post(deviceConnectionCheck, async (req, res, next) => {
    try {
      const {
        name,
        deviceModelName,
        manufacturer,
        location,
        edgeSerialNumber,
        networkInterface,
        networkConfig,
        description,
        userId,
        departmentId
      } = req.body
      console.log(req.body)
      const device = await Device.create({
        name,
        deviceModelName,
        manufacturer,
        location,
        edgeSerialNumber,
        networkInterface,
        networkConfig,
        description,
        userId,
        departmentId
      })
      res.status(201).json(device)
    } catch (err) {
      next(err)
    }
  })

  router.route('/:id')
    .get(async (req, res, next) => {
      try {
        const result = await Device.findByPk(req.params.id)
        res.json(result)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })
    .put(async (req, res, next) => {
      try {
        const {
          name,
          deviceModelName,
          manufacturer,
          location,
          edgeSerialNumber,
          networkInterface,
          networkConfig,
          description,
          userId,
          departmentId
          } = req.body
        const result = await Device.update({
          name,
          deviceModelName,
          manufacturer,
          location,
          edgeSerialNumber,
          networkInterface,
          networkConfig,
          description,
          userId,
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
        const result = await Device.destroy({where: {id: req.params.id}})
        res.json(result)
      } catch(err) {
        console.error(err)
        next(err)
      }
    })
  module.exports = router

