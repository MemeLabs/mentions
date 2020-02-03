const fs = require('fs')

module.exports = {
  disable: (username, optedinJSON, ws) => {
    // Removing user's name from JSON's user array. It does this by getting the posititon of said user's name in the array 
    // and then splicing it from the array
    optedinJSON["users"].splice(optedinJSON["users"].indexOf(username), 1)

    // Writing the new json to the json file
    fs.writeFileSync('./users/optedin.json', JSON.stringify(optedinJSON))

    // Deleting user's mentions.
    fs.unlinkSync(`./users/${username}.txt`)

    // Telling user they have opted out.
    ws.send(`PRIVMSG {"nick":"${username}", "data":"You are now opted out of mentions and your logs are deleted."}`)
  },
  enable: function(username, optedinJSON, chatTools) {
    if (optedinJSON["users"].includes(username)) {
      // Self explanatory
      chatTools.sendPrivateMessage(username, "You are already opted in. If you would like to opt out type \`!mentions optout\`, or whisper \`optout\`.")
    } else if (!(optedinJSON["users"].includes(username))) {

      // Pushing a new item the users array
      optedinJSON["users"].push(username)

      // Writing the new json to the json file
      fs.writeFileSync('./users/optedin.json', JSON.stringify(optedinJSON))

      // Creating user's log file
      fs.appendFileSync(`./users/${username}.txt`, '')

      // Telling the user they have opted in to be logged.
      chatTools.sendPrivateMessage(username, "Your mentions are now being logged.")
    }
  }
}