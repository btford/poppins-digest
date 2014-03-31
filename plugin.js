
//var color   = require('color');
var express = require('express');

module.exports = function (poppins) {
  var plugins = poppins.plugins,
      server  = poppins.server;

  plugins.digest = {
    json: function (req, res) {
      res.send(plugins.digest.data);
    },
    data: {},
    isTriaged: function (issue) {
      return issue.state === 'open' && !!issue.milestone;
    },
    nextIssue: function () {
      return Object.keys(poppins.issues).
        map(function (number) {
          return poppins.issues[number];
        }).
        filter(plugins.digest.isTriaged).
        sort(function (a, b) {
          if (a._lastRequested && !b._lastRequested) {
            return -1;
          }
          if (b._lastRequested && !a._lastRequested) {
            return 1;
          }
          return a._lastRequested > b._lastRequested ? -1 :
                 a._lastRequested < b._lastRequested ?  1 :
                 a.number > b.number ? -1 :
                 a.number < b.number ? 1 : 0;
        })[0];
    }
  };

  poppins.on('issueClosed', function (data) {
    enqueueTriage(data.issue);
  });

  poppins.on('issueTriaged', enqueueTriage);

  function enqueueTriage(issue) {
    var date = getUTCDateString();
    plugins.digest.data[date] = plugins.digest.data[date] || [];
    plugins.digest.data[date].push(issue);
  }

  setInterval(function () {
    if (this.requestQueue.length > 0) {
      return;
    }
    var issue = plugins.digest.nextIssue();
    issue._lastRequested = Date.now();
    poppins.log('polling #' + issue.number);
    poppins._enqueRequest(poppins.getIssue, [issue.number]).then(function (issue) {
      poppins.issues[number] = _.merge({}, poppins.issues[number], issue);
      poppins.issues[number]._updated = Date.now();
      poppins._cacheIssues();
      if (plugins.digest.isTriaged(issue)) {
        poppins.emit('issueTriaged', issue);
      }
    });
  }, 10 * 1000)


  server.get('/triage-log/api', plugins.digest.json);
  server.use('/triage-log', express.static(__dirname + '/public'));
};

function getUTCDateString() {
  var x = new Date();
  return [x.getUTCFullYear(), x.getUTCDate(), x.getUTCMonth()].join('/');
}