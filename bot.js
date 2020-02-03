const fs = require('fs');

// from ./tools/
const format_timestamp = require('./src/tools/format_time')
const log_link = require('./src/tools/log_link.js')

// from ./commands/
const clear_log = require('./src/commands/clear.js')
const opting = require('./src/commands/opting.js')

// Config
const config = JSON.parse(fs.readFileSync('./src/config.json'))
const JWT_TOKEN = config.jwt_token

const WebSocket = require('ws');
const ws = new WebSocket('wss://chat.strims.gg/ws', { headers: { Cookie: `;jwt=${JWT_TOKEN}` } });

//
//  JSON
//

optedinJSON = JSON.parse(fs.readFileSync('./logs/optedin.json').toString())



//
//  File Manipulation
//

var usersDirectoryArray = [];
var usersDirectory = fs.readdirSync('./logs/')
const EvalOptInUsers = () => {
  usersDirectory = fs.readdirSync('./logs/')
  for (i in usersDirectory) {
    // this skips an iteration of the loop if it is the optedin.json file
    if (usersDirectory[i] === 'optedin.json') { continue }
    // adds
    usersDirectoryArray.push(usersDirectory[i].split('.')[0])
  }
}
EvalOptInUsers()

//
//  WebSocket
//

// Chat tools
var chatTools = {
  sendChatMessage : (message) => {
    ws.send(`MSG {"data":"${message}"}`)
  },
  sendPrivateMessage : (username, message) => {
    ws.send(`PRIVMSG {"nick":"${username}", "data":"${message}"}`)
  }
}


// On WebSocket Connect
ws.on('open', () => {
  console.log('Connected and ready.')
})

// On Websocket Disconnect
ws.on('close', () => {
  let time = new Date().toLocaleString()
  console.log(`[${time}] DISCONNECTED`)
})

// On WebSocket Messaged Received
ws.on('message', (e) => {
  // Example of e.data
  // JOIN {"nick":"Fatal","features":[],"timestamp":1577117797198}
  const WebSocketMessagePrefix = e.split(' ', 1).toString()
  const WebSocketMessage = e

  // Creating JSON object with the websocket message minus the 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG' before the array
  const message = JSON.parse(WebSocketMessage.substr(WebSocketMessagePrefix.length + 1))

  // Adding new JSON key and value for type of message sent, example: 'NAMES', 'JOIN', 'LEAVE', 'MSG', 'PRIVMSG'
  message.type = WebSocketMessagePrefix

  if (message.type === 'MSG' && message.data.startsWith('!mentions')) {
    args = message.data.split(' ')
    if (args.length === 1) {
      if (usersDirectoryArray.includes(message.nick)) {
        sendLogs(message)
      } else if (!(optedinJSON.users.includes(message.nick))) {
        sendPrivateMessage(message.nick, 'You do not have a file. If you would like to be logged type `/w mentions help` to learn more about it.')
      }
    }

    switch (args[1]) {
      case "enable":
        opting.enable(message.nick, optedinJSON, chatTools)
        EvalOptInUsers()
        break;
      case "disable":
        opting.disable(message.nick, optedinJSON, ws)
        EvalOptInUsers()
        break;
      case "help":
        log_link.grabLog(message.nick, ws)
        break;
    }
  }

  if (message.type === 'PRIVMSG') {
    args = message.data.split(' ')
    switch (args[0]) {
      case "enable":
        opting.enable(message.nick, optedinJSON, chatTools)
        EvalOptInUsers()
        break;
      case "disable":
        opting.disable(message.nick, optedinJSON, chatTools)
        EvalOptInUsers()
        break;
      case "clear":
        clear_log.clear(message.nick, chatTools)
        break;
      case "list":
        log_link.grabLog(message.nick, chatTools)
        break;
      case "help":
        chatTools.sendPrivateMessage(message.nick, 'Commands: `enable`,`disable`,`list`,`clear`,`help`')
        break;
    }
  }
})