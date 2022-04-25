const mqtt = require('mqtt')

const mqttConnectionCheck = (req, res, next) => {
  const client = mqtt.connect('mqtt://localhost:1883')
  client.on('connect', () => {
    console.log('connected')
    next()
  })
  client.on('error', (err) => {
    console.error(err)
    next(err)
    client.end()
  })
}

const simulatorStart = (req, res, next) => {
  const client = mqtt.connect('mqtt://localhost:1883')
  const timedefault = req.body.endtime ? req.body.endtime : 2
  client.on('connect', () => {
    console.log('connected')
    next()
  })
  client.subscribe('metacamp/sensor')
  client.on('message', (topic, message, packet) => {
    console.log(`topic:${topic} message is ` + message)
  } )
  const dataPublish = setInterval(() => {
    const json = {
      'temperature': (Math.random()*(26-19) + 19).toFixed(2),
      'humidity': (Math.random()*(60-64) + 60).toFixed(2),
      'datetime': new Date()
    }
    client.publish('metacamp/sensor', JSON.stringify(json))
  }, 1000)
  setTimeout(() => {
    clearInterval(dataPublish)
    console.log("타이머 종료")
    next()
  }, timedefault * 1000);
  client.on('error', (err) => {
      console.error(err)
      next(err)
      client.end()
  })
}

module.exports = { mqttConnectionCheck, simulatorStart }