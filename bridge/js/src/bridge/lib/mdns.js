// https://github.com/futomi/node-dns-sd

const mDnsSd = require('node-dns-sd')
const ping   = require('./ping')

const browsers = []

mDnsSd.ondata = (packet) => {
  const service = packet_to_service(packet)
  if (!service) return

  for (const browser of browsers) {
    browser.handleService(service)
  }
}

const packet_to_service = (packet) => {
  if (!packet || !(packet instanceof Object) || !packet.address || !packet.header || !(packet.header instanceof Object) || !packet.header.answers || !Array.isArray(packet.answers)  || !(packet.header.answers === packet.answers.length) || !packet.header.additionals || !Array.isArray(packet.additionals)  || !(packet.header.additionals === packet.additionals.length))
    return null

  const service = {
    address: packet.address
  }

  for (const answer of packet.answers) {
    if (answer && (answer instanceof Object) && answer.name && answer.rdata) {
      service.name     = answer.name
      service.fullname = answer.rdata
      break
    }
  }

  if (!service.name)
    return null

  for (const xtra of packet.additionals) {
    if ((xtra.name === service.fullname) && xtra.rdata && (xtra.rdata instanceof Object)) {
      if (xtra.type === 'TXT')
        service.txtRecord = xtra.rdata

      if ((xtra.type === 'SRV') && xtra.rdata.port)
        service.port = xtra.rdata.port
    }
  }

  if (!service.txtRecord || !service.port)
    return null

  return service
}

class DnsSdBrowser {
  constructor(filter, hasServiceChanged) {
    this.filter            = filter
    this.hasServiceChanged = (typeof hasServiceChanged === 'function') ? hasServiceChanged : null
    this.started           = false
    this.events            = {}
    this.services          = []

    setInterval(this.pingAllServices.bind(this), 5000)
  }

  pingAllServices() {
    for (const service of this.services) {
      ping(service.address, service.port, this.handlePing.bind(this))
    }
  }

  handlePing(pingResult) {
    if (pingResult.alive) return

    for (let i=0; i < this.services.length; i++) {
      const service = this.services[i]
      if ((service.address === pingResult.hostname) && (service.port === pingResult.port)) {
        this.services.splice(i, 1)
        this.handleEvent('serviceDown', service)
        break
      }
    }
  }

  on(event, callback) {
    if (!this.events[event])
      this.events[event] = []

    this.events[event].push(callback)
  }

  handleService(newService) {
    if (newService.name.indexOf(this.filter) >= 0) {
      let dupl_idx = -1
      let dupl_svc = null
      let has_diff = false

      for (let i=0; i < this.services.length; i++) {
        const oldService = this.services[i]
        if ((oldService.address === newService.address) && (oldService.port === newService.port)) {
          dupl_idx = i
          dupl_svc = oldService
          has_diff = !!this.hasServiceChanged && this.hasServiceChanged(oldService, newService)
          break
        }
      }
      if (dupl_svc && has_diff) {
        this.services.splice(dupl_idx, 1)
        this.handleEvent('serviceDown', dupl_svc)
        dupl_svc = null
      }
      if (!dupl_svc) {
        this.services.push(newService)
        this.handleEvent('serviceUp', newService)
      }
    }
  }

  handleEvent(event, service) {
    if (Array.isArray(this.events[event])) {
      for (const callback of this.events[event]) {
        callback(service)
      }
    }
  }

  start() {
    if (this.started) return

    this.started = true

    browsers.push(this)

    mDnsSd.startMonitoring()
  }

  stop() {
    if (!this.started) return

    this.started = false

    const index = browsers.indexOf(this)
    if (index >= 0)
      browsers.splice(index, 1)

    if (!browsers.length)
      mDnsSd.stopMonitoring()
  }
}

const createBrowser = (filter, hasServiceChanged) => {
  return new DnsSdBrowser(filter, hasServiceChanged)
}

module.exports = {
  createBrowser
}
