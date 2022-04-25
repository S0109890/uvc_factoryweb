const mqtt = require('mqtt')
const client = mqtt.connect("mqtt://localhost")

client.on('message', (topic,data)=>{
  console.log(`${topic}:${data}`);
})