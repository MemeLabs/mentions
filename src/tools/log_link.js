const request = require('request')
const fs = require('fs')
const format_timestamp = require('./format_time')

module.exports = {
  grabLog: function (username, chatTools) {
    try {
      if (!(fs.existsSync(`./logs/${username}.txt`))) {
        chatTools.sendPrivateMessage(username, 'You are not opted in. Type `/w mentions help` to learn more about it.')
        return
      } else {
        
        // Reading user's log file.
        var log = fs.readFileSync(`./logs/${username}.txt`)
        
        // Checks if user's file is empty and returning early if so.
        // sidenote: couldnt get if (log === '') to work
        if (log.length === 0) {
          chatTools.sendPrivateMessage(username, 'File is empty.')
          return
        }

        // Splits users log data by new line and filters out blank strings using .filter(Boolean)
        log = log.toString().split('\r\n').filter(Boolean)


        // For every line in the user's log file remove the timestamp
        // and convert it to '2d 10m ago' format by using the
        // format_timestamp tool found in ./src/tools/format_time.js
        for (i in log) {
          timestamp = format_timestamp.format(log[i].split(' ')[0])
          message = log[i].substr(log[i].split(' ')[0].length + 1)
          preformat = `${timestamp} | ${message}`
          log[i] = `${timestamp}` + ' '.repeat(13 - preformat.split('|')[0].length) + `| ${message}`
        }

        // Joining newly converted lines by a new line
        var file = log.join('\r\n')
        
        // Sending data off to uguu.se api and PM-ing the link to the user.
        const url = 'https://uguu.se/api.php?d=upload-tool';
        request.post(url, (err, res, body) => {
          if (err) {
            console.error(err)
          } else {
            chatTools.sendPrivateMessage(username, body)
          }
        }).form().append('file', file, {
          filename: `${username}.txt`,
          contentType: 'text/plain'
        })
        // sidenote: using 'return body' instead of sending
        // the link to the user inside this module would be
        // better but could not get it to work. -Abeous
      }
    } catch (e) { console.error(e) }
  }
}