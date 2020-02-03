const request = require('request')
const fs = require('fs')
const format_timestamp = require('./format_time')

module.exports = {
  grabLog: function (username, chatTools) {
    try {
      // Splits users log file by new line and filters out blank strings using .filter(Boolean)
      var log = fs.readFileSync(`./logs/${username}.txt`).toString().split('\r\n').filter(Boolean)

      for (i in log) {
        timestamp = format_timestamp.format(log[i].split(' ')[0])
        message = log[i].substr(log[i].split(' ')[0].length + 1)
        log[i] = `${timestamp} | ${message}`
      }

      var file = log.join('\r\n')
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
    } catch (e) { console.error(e) }
  }
}