const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost:8080')
client.publish('temp',"10")
console.log("??");