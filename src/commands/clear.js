const fs = require('fs')

module.exports = {
  clear: (username, ws) => { try {
      fs.writeFileSync(`./logs/${username}.txt`, '')
      ws.send(`PRIVMSG {"nick":"${username}", "data":"Your mentions log has been cleared."}`)
    } catch (e) { console.error(e) }
  }
}