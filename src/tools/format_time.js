const DATE_DIFF = require("date-diff-js");

module.exports = {
  format: function (timestamp) {
    try {
      let msgDate = new Date(parseInt(timestamp))
      let currentDate = new Date()
      let timeDiff = DATE_DIFF(msgDate, currentDate, 'H').outputs;

      let message;
      (timeDiff.hours === 0)
        ? (timeDiff.minutes === 0)
          ? message = timeDiff.seconds + 's ago'
          : message = timeDiff.minutes + 'm ' + timeDiff.seconds + 's ago'
        : message = timeDiff.hours + 'h ' + timeDiff.minutes + 'm ago'



      return message
    } catch (e) { console.error(e) }
  }
}
