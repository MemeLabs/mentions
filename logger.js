const WebSocket = require('ws')
const ReconnectingWebSocket = require('reconnecting-websocket')
const fs = require('fs')

// check if logs folder exists.
// if not, create logs folder and optedin.json file
// if it does, create array of files inside logs folder

try {
  if (!(fs.existsSync('./logs/'))) {
    fs.mkdirSync('./logs/')
    fs.appendFileSync('./logs/optedin.json', '{"users":[]}')
  } else {
    usersDirectory = fs.readdirSync('./logs/')
  }
} catch (e) {
  console.error(e)
}

var logDirectory = {
  Array: [],
  eval: function () {
    try {
      var usersDirectory = fs.readdirSync('./logs/')
      for (i in usersDirectory) {
        // this skips an iteration of the loop if it is the optedin.json file
        if (usersDirectory[i] === 'optedin.json') { continue }
        // adds file to self's Array
        this.Array.push(usersDirectory[i].split('.')[0])
      }
    } catch (e) { console.error(e) }
  }
}
logDirectory.eval()

//
//  WebSocket
//

const rws = new ReconnectingWebSocket('wss://chat.strims.gg/ws', [], {WebSocket: WebSocket, connectionTimeout: 20000});

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
    try {
      var optedinJSON = JSON.parse(fs.readFileSync('./logs/optedin.json').toString())
      optedinJSON.users.some(checkArray)
    } catch (e) {
      console.error(e)
    }
  }

})

rws.addEventListener('close', () => {
  rws.reconnect()
  let time = new Date().toLocaleString()
  console.log(`[${time}] DISCONNECTED`)
})