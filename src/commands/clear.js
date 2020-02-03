const fs = require('fs')

module.exports = {
  clear: (username, ws) => { try {
      fs.writeFileSync(`./users/${username}.txt`, '')
      ws.send(`PRIVMSG {"nick":"${username}", "data":"Your mentions log has been cleared."}`)
    } catch (e) { console.error(e) }
  }
}