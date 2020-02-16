const WebSocket = require('ws')
const ReconnectingWebSocket = require('reconnecting-websocket')
const fs = require('fs')
const config = require('./src/config.json')

// check if logs folder exists.
// if not, create logs folder and optedin.json file
// if it does, create array of files inside logs folder

try {
  if (!(fs.existsSync('./logs/'))) {
    fs.mkdirSync('./logs/')
    fs.appendFileSync('./logs/optedin.json', '{"users":[]}')
  } 
} catch (e) {
  console.error(e)
}

//
//  Optedin.json event watching
//

var optedIN = {
  users: JSON.parse(fs.readFileSync('./logs/optedin.json')).users,
  eval: function() { try {
      fs.readFile('./logs/optedin.json', (err, data) => {
        this.users = JSON.parse(data).users
      })
    } catch (e) { console.error(e) }
  } 
}
optedIN.eval()

fs.watch('./logs/optedin.json', (event, filename) => {
  if (event === 'change') {
    optedIN.eval()
  } 
})

//
//  Log Writing
//

const writeLog = (name, message) => {
  var fileLocation = `./logs/${name}.txt`
  fs.readFile(fileLocation, 'utf8', (err, data) => {
    var lines = data.split('\r\n').filter(Boolean)
    var newMessage = `${message.timestamp} ${message.nick}: ${message.data}`

    if (lines.length === config.loglimit) {
      lines.shift()
      lines.push(newMessage)
    } else if (lines.length < config.loglimit) {
      lines.push(newMessage)
    }

    fs.writeFile(fileLocation, lines.join('\r\n'), (err) => {
      (err) ? console.error(err) : null
    })
  })
}

//
//  WebSocket
//

const rws = new ReconnectingWebSocket('wss://chat.strims.gg/ws', [], { WebSocket: WebSocket, connectionTimeout: 20000 });

rws.addEventListener('open', () => {
  let time = new Date().toLocaleString()
  console.log(`[${time}] LOGGER CONNECTED`)
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

  if (message.type === 'MSG') { 
    optedIN.users.some(name => {
      if (String(message.data).toLowerCase().includes(name.toLowerCase())) {
        fs.exists(`./logs/${name}.txt`, (bool) => {
          if (bool) {
            writeLog(name, message)
          } else if (!bool) {
            fs.appendFile(`./logs/${name}.txt`)
          }
        })
      }
    })
  }
})

rws.addEventListener('close', () => {
  rws.reconnect()
  let time = new Date().toLocaleString()
  console.log(`[${time}] LOGGER DISCONNECTED`)
})