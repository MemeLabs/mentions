const fs = require('fs');

// from ./tools/
const format_timestamp = require('./src/tools/format_time')
const log_link = require('./src/tools/log_link.js')

// from ./commands/
const clear_log = require('./src/commands/clear.js')
const opting = require('./src/commands/opting.js')
const help = require('./src/commands/help.js')

// Config
const config = JSON.parse(fs.readFileSync('./src/config.json'))
const JWT_TOKEN = config.jwt_token

// WebSocket
const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket')

//
//  JSON
//

var optedIn = {
  JSON: JSON.parse(fs.readFileSync('./logs/optedin.json').toString()),
  eval: () => {
    this.JSON = JSON.parse(fs.readFileSync('./logs/optedin.json').toString())
  }
}

//
//  File Management
//

// Users Directory Object
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

const RWSoptions = {
  WebSocket: WebSocket,
  connectionTimeout: 10000
}

const rws = new ReconnectingWebSocket('wss://chat.strims.gg/ws', { headers: { Cookie: `;jwt=${JWT_TOKEN}`}}, RWSoptions);

// Chat tools object
var chatTools = {
  sendChatMessage: (message) => {
    rws.send(`MSG {"data":"${message}"}`)
  },
  sendPrivateMessage: (username, message) => {
    rws.send(`PRIVMSG {"nick":"${username}", "data":"${message}"}`)
  }
}


// On WebSocket Connect
rws.addEventListener('open', () => {
  let time = new Date().toLocaleString()
  console.log(`[${time}] CONNECTED`)
})


// On WebSocket Messaged Received
rws.addEventListener('message', (e) => {
  try {
    // Example of e.data
    // JOIN {"nick":"Fatal","features":[],"timestamp":1577117797198}
    const WebSocketMessagePrefix = e.data.split(' ', 1).toString()
    const WebSocketMessage = e.data

    // Creating JSON object with the websocket message minus the 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG' before the array
    const message = JSON.parse(WebSocketMessage.substr(WebSocketMessagePrefix.length + 1))

    // Adding new JSON key and value for type of message sent, example: 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG'
    message.type = WebSocketMessagePrefix

    if (message.type === 'MSG' && message.data.startsWith('!mentions')) {
      args = message.data.split(' ')
      if (args.length === 1) {
        if (logDirectory.Array.includes(message.nick)) {
          log_link.grabLog(message.nick, chatTools)
        } else if (!(optedIn.JSON["users"].includes(message.nick))) {
          chatTools.sendPrivateMessage(message.nick, 'You do not have a file. If you would like to be logged type `/w mentions help` to learn more about it.')
        }
      }

      switch (args[1]) {
        case "enable":
          opting.enable(message.nick, optedIn.JSON, chatTools)
          optedIn.eval()
          logDirectory.eval()
          break;
        case "disable":
          opting.disable(message.nick, optedIn.JSON, chatTools)
          optedIn.eval()
          logDirectory.eval()
          break;
        case "help":
          help.send(message, chatTools)
          break;
        default:
          log_link.grabLog(message.nick, chatTools)
      }
    }

    if (message.type === 'PRIVMSG') {
      args = message.data.split(' ')
      switch (args[0]) {
        case "enable":
          opting.enable(message.nick, optedIn.JSON, chatTools)
          optedIn.eval()
          logDirectory.eval()
          break;
        case "disable":
          opting.disable(message.nick, optedIn.JSON, chatTools)
          optedIn.eval()
          logDirectory.eval()
          break;
        case "clear":
          clear_log.clear(message.nick, chatTools)
          break;
        case "list":
          log_link.grabLog(message.nick, chatTools)
          break;
        case "help":
          help.send(message, chatTools)
          break;
        default:
          chatTools.sendChatMessage(message.nick, "Unknown command. Type `/w mentions help` to learn more.")
      }
    }
  } catch (e) { console.log(e) }
})

// On Websocket Disconnect
rws.addEventListener('close', () => {
  rws.reconnect()
  let time = new Date().toLocaleString()
  console.log(`[${time}] DISCONNECTED`)
})