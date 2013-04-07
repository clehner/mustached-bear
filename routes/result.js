var request = require('request');
var url = require('url');

/*
 * GET home page.
 */

function pickMax(array, picker) {
  var maxValue = -Infinity, maxI = -1;
  for (var i = 0; i < array.length; i++) {
    var value = picker(array[i]);
    if (value > maxValue) {
      maxValue = value;
      maxI = i;
    }
  }
  return array[maxI];
}

function getArticles(query, page, cb) {
  request(url.format({
    protocol: 'http',
    host: 'api.nytimes.com',
    pathname:  '/svc/search/v2/articlesearch.json',
    query: {
      q: query,
      page: page,
      sort: 'newest',
      'api-key': 'columbiahack'
    }
  }), function (error, response, body) {
    if (error || response.statusCode != 200) {
      cb(new Error(error || 'error ' + response));
    } else {
      try {
        var results = JSON.parse(body);
        var docs = results.response.docs;
        var items = docs.map(function (doc) {
          // get the biggest image
          var image = pickMax(doc.multimedia, function (img) {
            return img.width;
          });
          if (!image) {
            // no image, no win
            return;
          }

          return {
            id: doc._id,
            title: doc.section_name,
            text: doc.snippet,
            image: '//nytimes.com/' + image.url,
            width: image.width,
            height: image.height
          };
        }).filter(Boolean);
        cb(null, items);
      } catch(e) {
        cb(e);
      }
    }
  });
}

exports.list = function(req, res) {
  getArticles(req.query.q, ~~req.query.page, function (err, results) {
    if (err) {
      res.send([{success: false, error: err.toString()}]);
    } else {
      res.send(results);
    }
  });
};
