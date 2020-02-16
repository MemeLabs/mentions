const fs = require('fs')

module.exports = {
  clear: (username, chatTools) => { try {
      fs.writeFileSync(`./logs/${username}.txt`, '')
      chatTools.sendPrivateMessage(username, "Your mentions log has been cleared.")
    } catch (e) { console.error(e) }
  }
}