const {createConnection} = require('node:net')

const ping = (hostname, port, callback, timeout = 3000) => {
  const socket = createConnection(port, hostname)
  const handleSuccess = () => {
    socket.end()
    callback({alive: true, hostname, port})
  }
  const handleFailure = () => {
    socket.destroy()
    callback({alive: false, hostname, port})
  }

  socket.setTimeout(timeout)
  socket.on('connect', handleSuccess)
  socket.on('timeout', handleFailure)
  socket.on('error',   handleFailure)
}

module.exports = ping
