
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {});
};

exports.about = function(req, res){
  res.render('about', {
    query: req.query.query
  });
};

exports.search = function(req, res){
  res.render('search', {
    query: req.query.query
  });
};
