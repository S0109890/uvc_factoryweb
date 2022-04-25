const axios = require('axios')

const deviceConnectionCheck = async (req, res, next) => {
  try {
    const result = await axios.get(req.body.networkConfig['url'])
    console.log(result.data)
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = deviceConnectionCheck