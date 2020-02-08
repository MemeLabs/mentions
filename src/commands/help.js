module.exports = {
  send: (message, chatTools) => {
    var args = message.data.split(' ')
    commands = ['enable', 'disable', 'clear', 'list', 'help']
    
    var commandIndex = (message.type === 'PRIVMSG') ? 1 : 2

    if (args.length === 1) {
      chatTools.sendPrivateMessage(message.nick, "Wowee If you want your mentions to be logged type `/w mentions enable` and to disable them `/w mentions disable`. If you want to access them type `/w mentions list`. You can also learn more commands by typing `/w mentions help commands` ComfyCat")
      return;
    }

    switch (args[commandIndex]) {
      case "enable":
        chatTools.sendPrivateMessage(message.nick, "Usage: `/w mentions enable` This is used to opt-in to your mentions being logged. Only your last 5 mentions are logged.")
        break;
      case "disable":
        chatTools.sendPrivateMessage(message.nick, "Usage: `/w mentions disable` This disables the logging of your mentions and deletes your log.")
        break;
      case "clear":
        chatTools.sendPrivateMessage(message.nick, "Usage: `/w mentions clear` If you are opted in to mentions this clears your log.")
        break;
      case "list":
        chatTools.sendPrivateMessage(message.nick, "Usage `/w mentions list` or `!mentions` If you are opted into mentions this displays your last 5 mentions. (cannot view more than 5)")
        break;
      case "help":
        chatTools.sendPrivateMessage(message.nick, "Displays basic information and how to view more about individual commands.")
        break;
      case "commands":
        chatTools.sendPrivateMessage(message.nick, "Commands: `enable`,`disable`,`list`,`clear`,`help` To learn more about each command type `/w mentions help {command}`.")
        break;
      default:
        chatTools.sendPrivateMessage(message.nick, "Unknown command.")
        break;
    }


  }
}