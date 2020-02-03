const fs = require('fs')

const WebSocket = require('ws');
const ws = new WebSocket('wss://chat.strims.gg/ws');

ws.on('open', () => {
  console.log('Connected.')
})

var usersDirectoryArray = [];
var usersDirectory = fs.readdirSync('./logs/')
for (i in usersDirectory) {
  // this skips an iteration of the loop if it is the optedin.json file
  if (usersDirectory[i] === 'optedin.json') { continue }
  // adds
  usersDirectoryArray.push(usersDirectory[i].split('.')[0])
}

ws.on('close', () => {
  var today = new Date();
  var dateTime = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes();

  console.log('[' + dateTime + ']' + 'DISCONNECTED.')
})

ws.on('message', (e) => {
  // Example of e.data
  // JOIN {"nick":"Fatal","features":[],"timestamp":1577117797198}
  const WebSocketMessagePrefix = e.split(' ', 1).toString()
  const WebSocketMessage = e

  var optedinJSON = JSON.parse(fs.readFileSync('./logs/optedin.json').toString())

  // Creating JSON object with the websocket message minus the 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG' before the array
  const message = JSON.parse(WebSocketMessage.substr(WebSocketMessagePrefix.length + 1))

  // Adding new JSON key and value for type of message sent, example: 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG'
  message.type = WebSocketMessagePrefix

  const checkArray = (name) => {
    if (message.data.includes(name)) {
      if (!(usersDirectoryArray.includes(`${name}.txt`))) {fs.writeFileSync(`./logs/${name}.txt`, '')}
      var userFileArray = fs.readFileSync(`./logs/${name}.txt`, 'utf-8').split('\r\n').filter(Boolean)
      if (userFileArray.length === 5) {
        userFileArray.shift()
        var today = new Date();
        var dateTime = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + today.getSeconds();
        userFileArray.push(`${message.timestamp} ${message.nick}: ${message.data}`)
        fs.writeFileSync(`./logs/${name}.txt`, userFileArray.join(`\r\n`))
      } else {
        fs.appendFileSync(`./logs/${name}.txt`, `${message.timestamp} ${message.nick}: ${message.data}\r\n`)
      }
    }
  }

  if (message.type === 'MSG') {
    optedinJSON.users.some(checkArray)
  }
})