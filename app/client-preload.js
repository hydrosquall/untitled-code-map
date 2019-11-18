// https://github.com/jlongster/electron-with-server-example/blob/master/client-preload.js
const { ipcRenderer } = require('electron')
const isDev = require('electron-is-dev')
const ipc = require('node-ipc')
const uuid = require('uuid')

let resolveSocketPromise
const socketPromise = new Promise(resolve => {
  resolveSocketPromise = resolve
})

window.IS_DEV = isDev

window.getServerSocket = () => {
  return socketPromise
}

ipcRenderer.on('set-socket', (event, { name }) => {
  resolveSocketPromise(name)
})

window.ipcConnect = (id, func) => {
  ipc.config.silent = true
  ipc.connectTo(id, () => {
    func(ipc.of[id])
  })
}

window.uuid = uuid;

window.process = process;
