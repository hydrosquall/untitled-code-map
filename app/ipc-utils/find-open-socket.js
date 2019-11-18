// https://github.com/jlongster/electron-with-server-example
const ipc = require('node-ipc');

const APP_ID = 'interactiveCodeMap';
function isSocketTaken(name, fn) {
  return new Promise((resolve, reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name);
        resolve(false);
      });

      ipc.of[name].on('connect', () => {
        ipc.disconnect(name);
        resolve(true);
      });
    });
  });
}

async function findOpenSocket() {
  let currentSocket = 1;
  console.log('Checking socket', currentSocket);
  while (await isSocketTaken(APP_ID + currentSocket)) {
    currentSocket++;
    console.log('checking next socket', currentSocket);
  }
  console.log(`Matched socket ${currentSocket}`);
  return APP_ID + currentSocket;
}

module.exports = findOpenSocket;
