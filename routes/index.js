
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'mustached-bear' });
};

exports.search = function(req, res){
  res.render('search', {
    title: 'mustached-bear',
    query: req.query.query
  });
};
