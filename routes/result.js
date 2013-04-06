var request = require('request');
var url = require('url');

/*
 * GET home page.
 */

exports.list = function(req, res){

  request(url.format({
    protocol: 'http',
    host: 'api.nytimes.com',
    pathname:  '/svc/search/v2/articlesearch.json',
    query: {
      q: 'new york times',
      page: 1,
      sort: 'newest',
      'api-key': 'columbiahack'
    }
  }), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      //console.log(body) // Print the google web page.
      res.render('result', {
        title: 'mustached-bear',
        results: data
      });
    } else {
      res.render('index', {
        title: 'mustached-bear: error',
        results: 'There was an error! bad bad bad'
      });
    }
  })

};
