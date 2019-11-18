// https://github.com/jlongster/electron-with-server-example
// console.log(__dirname);
const serverHandlers = require('./ipc-server/server-handlers');
const ipc = require('./ipc-server/server-ipc.js');

let isDev;
let version;

if (process.argv[2] === '--subprocess') {
  isDev = false
  version = process.argv[3]

  const socketName = process.argv[4]
  ipc.init(socketName, serverHandlers)
} else {
  const { ipcRenderer, remote } = require('electron')
  isDev = true
  version = remote.app.getVersion()

  ipcRenderer.on('set-socket', (event, { name }) => {
    ipc.init(name, serverHandlers)
  })
}

console.log("> Server Metadata")
console.log({version, isDev})
