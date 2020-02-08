const WebSocket = require('ws')
const ReconnectingWebSocket = require('reconnecting-websocket')
const fs = require('fs')


var logDirectory = {
  Array: [],
  eval: function () {
    usersDirectory = fs.readdirSync('./logs/')
    for (i in usersDirectory) {
      // this skips an iteration of the loop if it is the optedin.json file
      if (usersDirectory[i] === 'optedin.json') { continue }
      // adds
      this.Array.push(usersDirectory[i].split('.')[0])
    }
  }
}
logDirectory.eval()

//
//  WebSocket
//

const rws = new ReconnectingWebSocket('wss://chat.strims.gg/ws', [], {WebSocket: WebSocket, connectionTimeout: 10000});

rws.addEventListener('open', () => {
  let time = new Date().toLocaleString()
  console.log(`[${time}] CONNECTED`)
})


rws.addEventListener('message', (e) => {
  // Example of e.data
  // JOIN {"nick":"Fatal","features":[],"timestamp":1577117797198}
  const WebSocketMessagePrefix = e.data.split(' ', 1).toString()
  const WebSocketMessage = e.data
  
  
  // Creating JSON object with the websocket message minus the 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG' before the array
  const message = JSON.parse(WebSocketMessage.substr(WebSocketMessagePrefix.length + 1))
  
  // Adding new JSON key and value for type of message sent, example: 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG'
  message.type = WebSocketMessagePrefix
  
  const checkArray = (name) => {
    if (message.data.includes(name)) {
      logDirectory.eval()
      
      if (!(logDirectory.Array.includes(`${name}.txt`))) {fs.writeFileSync(`./logs/${name}.txt`, '')}
      
      var userFileArray = fs.readFileSync(`./logs/${name}.txt`, 'utf-8').split('\r\n').filter(Boolean)
      
      if (userFileArray.length === 5) {
        userFileArray.shift()
        userFileArray.push(`${message.timestamp} ${message.nick}: ${message.data}`)
        fs.writeFileSync(`./logs/${name}.txt`, userFileArray.join(`\r\n`))
      } else {
        fs.appendFileSync(`./logs/${name}.txt`, `${message.timestamp} ${message.nick}: ${message.data}\r\n`)
      }
    }
  }
  
  if (message.type === 'MSG') {
    var optedinJSON = JSON.parse(fs.readFileSync('./logs/optedin.json').toString())
    optedinJSON.users.some(checkArray)
    if (message.data.includes('mentions close')){
      rws.close()
    }
  }

})

rws.addEventListener('close', () => {
  rws.reconnect()
  let time = new Date().toLocaleString()
  console.log(`[${time}] DISCONNECTED`)
})