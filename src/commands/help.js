module.exports = {
  send: (message, chatTools) => {
    const args = message.data.split(' ')
    const commandIndex = (message.type === 'PRIVMSG') ? 1 : 2

    /*
     * Implemented LUT Architecture, which makes the output O(1) Time Complexity.  
     * Easily Scaleable, to add more commands add to data obecjt.
     * "command" : "message" 
    **/
    const data = {
      "enable":  "Usage: `/w mentions enable` This is used to opt-in to your mentions being logged. Only your last 5 mentions are logged.",
      "disable": "Usage: `/w mentions disable` This disables the logging of your mentions and deletes your log.",
      "clear": "Usage: `/w mentions clear` If you are opted in to mentions this clears your log.",
      "list": "Usage `/w mentions list` or `!mentions` If you are opted into mentions this displays your last 5 mentions. (cannot view more than 5)",
      "help": "Displays basic information and how to view more about individual commands.",
      "commands": "Commands: `enable`,`disable`,`list`,`clear`,`help` To learn more about each command type `/w mentions help {command}`."
    }

    if (args.length === 1) {
      chatTools.sendPrivateMessage(message.nick, "Wowee If you want your mentions to be logged type `/w mentions enable` and to disable them `/w mentions disable`. If you want to access them type `/w mentions list`. You can also learn more commands by typing `/w mentions help commands` ComfyCat")
      return;
    }
    
    const user_input = args[commandIndex];

    /*
     * If the command entered exists inside the look up table then proceed by outputting its corresponding message
     * data[user_input] is O(1)
    **/
    if(data[user_input]) chatTools.sendPrivateMessage(message.nick, data[user_input])
    else chatTools.sendPrivateMessage(message.nick, "Unknown command.")
    
  }
}