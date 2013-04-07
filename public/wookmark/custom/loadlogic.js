var handler = null;
var page = 0;
var isLoading = 0;
var apiURL = '/result';
var parselyAPIURL = 'http://hack.parsely.com/hackapi/search';
//var oEmbedAPIURL = 'http://api.embed.ly/1/oembed';
var etsyAPIURL = 'http://openapi.etsy.com/v2/';
var tumblrAPIURL = 'http://api.tumblr.com/v2/';
var tumblrBeforeTimestamp = 0;
var bitlyAPIURL = 'https://api-ssl.bitly.com/v3/';
var foursquareAPIURL = 'https://api.foursquare.com/v2/';
var exfmAPIURL = 'http://ex.fm/api/v3/';

var imageUrlRe = /"image_url":(".*(?:\/\/)*")/;

var amounts = {
  etsy: 4,
  tumblr: 4,
  parsely: 3,
  bitly: 3,
  foursquare: 2,
  exfm: 3
};

// get initial search query from URL
var queryRe = /query=([^&]*)/;
var query = (location.hash.match(queryRe) ||
  location.search.match(queryRe) || 0)[1];

if(history.pushState) {
  history.pushState({query: query}, document.title, location.href);

  window.onpopstate = function (e) {
    if (e.state) {
      query = e.state.query;
      clearData();
      loadData();
    }
  };
}

// Prepare layout options.
var options = {
  autoResize: true, // This will auto-update the layout when the browser window is resized.
  container: $('#tiles'), // Optional, used for some extra CSS styling
  offset: 25, // Optional, the distance between grid items
  itemWidth: 310 // Optional, the width of a grid item
};

/**
  * When scrolled all the way to the bottom, add more tiles.
  */
function onScroll(event) {
  // Only check when we're not still waiting for data.
  if(!isLoading) {
    // Check if we're within 100 pixels of the bottom edge of the broser window.
    var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
    if(closeToBottom) {
      loadData();
    }
  }
}

/**
  * Refreshes the layout.
  */
function applyLayout() {
  // Create a new layout handler.
  handler = $('#tiles li');
  handler.wookmark(options);
}

/**
  * Clear the rendered data
  */
function clearData() {
  page = 0;
  tumblrBeforeTimestamp = 0;
  $('#tiles').empty();
}

/**
  * Loads data from the API.
  */
function loadData() {
  loadNYTData();
  loadParselyData();
  loadEtsyData();
  loadTumblrData();
  loadBitlyData();
  loadFoursquareData();
  loadexfmData();
  page++;

  if (isLoading) $('#loaderCircle').show();
}

function loadNYTData() {
  isLoading++;
  $.ajax({
    url: apiURL,
    dataType: 'json',
    data: {
      query: query,
      page: page
    },
    success: onLoadNYTData
  });
}

function loadParselyData() {
  isLoading++;
  $.ajax({
    url: parselyAPIURL,
    dataType: 'jsonp',
    data: {
      apikey: 'arstechnica.com',
      q: query,
      limit: amounts.parsely,
      page: page+1
    },
    success: onLoadParselyData
  });
}

function loadEtsyData() {
  if (!query) {
    // etsy requires a query
    return;
  }
  isLoading++;
  $.ajax({
    url: etsyAPIURL + 'listings/active.js',
    dataType: 'jsonp',
    data: {
      api_key: 'eyrvku6gczxoorsxjzwohe45',
      keywords: query,
      fields: 'listing_id,title,url',
      includes: 'Images',
      offset: page * amounts.etsy,
      limit: amounts.etsy
    },
    success: onLoadEtsyData
  });
}

function loadTumblrData() {
  isLoading++;
  $.ajax({
    url: tumblrAPIURL + 'tagged',
    dataType: 'jsonp',
    data: {
      api_key: 'zugEBprGJG0o3XRNDfZkVmaOYO3pLNtiOkiEmHncixdHrFdAFu',
      tag: query,
      limit: amounts.tumblr,
      before: tumblrBeforeTimestamp
    },
    success: onLoadTumblrData
  });
}

function loadBitlyData() {
  isLoading++;
  $.ajax({
    url: bitlyAPIURL + 'search',
    dataType: 'jsonp',
    data: {
      access_token: 'db9a6bed0293e5f63bcbf1b87e7c3c25d106db10',
      query: query,
      limit: amounts.bitly,
      offset: page*amounts.bitly,
      fields: 'id,url,summaryText,summaryTitle,aggregate_link'
    },
    success: onLoadBitlyData
  });
}

function loadFoursquareData() {
  isLoading++;
  // API does not provide page/offset/ship, so we request 50 results at once
  // and then render them gradually.
  $.ajax({
    url: foursquareAPIURL + 'venues/search',
    dataType: 'jsonp',
    data: {
      client_id: 'CADCUHLDLI4E1LQ4144ZI5GMMLXJRJLR22QU0PG1MC4NLZII',
      client_secret: 'JSCQ5AYWNS5R305WNGRCD25D0TAXF1CVLCSDSQFLTJXJWBBQ',
      query: query,
      intent: 'global',
      v: 20130417,
      limit: (page+1)*amounts.foursquare
    },
    success: onLoadFoursquareData
  });
}

function loadexfmData() {
  // exfm requires a query to search
  if (!query) return;
  isLoading++;
  // API does not provide page/offset/ship, so we request 50 results at once
  // and then render them gradually.
  $.ajax({
    url: exfmAPIURL + 'song/search/' + encodeURIComponent(query),
    dataType: 'jsonp',
    data: {
      start: page * amounts.exfm,
      results: amounts.exfm
    },
    success: onLoadexfmData
  });
}

/**
  * Receives data from an API
  */
function onLoadNYTData(data) {
  // Increment page index for future calls.
  addItems(data);
}

function onLoadParselyData(data) {
  var items = data.data.map(function (doc) {
    // sometimes the JSON is fail, so use a regex to get the image url
    var image = doc.image_url;
    if (!image && doc.metadata) {
      var matches = doc.metadata.match(imageUrlRe);
      image = matches && JSON.parse(matches[1]);
    }
    return {
      id: doc.url,
      url: doc.url,
      title: doc.title,
      image: image
    };
  });
  addItems(items);
}

function onLoadEtsyData(data) {
  var items = data.results.map(function (listing) {
    var img = listing && listing.Images && listing.Images[0];
    return {
      id: listing.listing_id,
      title: listing.title,
      url: listing.url,
      image: img.url_570xN,
      width: img.full_width,
      height: img.full_height
    };
  });
  addItems(items);
}

function onLoadTumblrData(data) {
  if (!data || !data.meta || data.meta.msg != 'OK') {
    addItems([]);
    return;
  }
  var items = data.response.map(function (post) {
    var img;
    if (post.photos) {
      var alts = post.photos[0].alt_sizes;
      img = alts[alts.length-4] || alts[0];
    } else {
      img = {url: post.image_permalink};
    }
    return {
      id: post.id,
      title: post.title,
      url: post.post_url,
      text: post.tags.join(', '),
      image: img.url,
      width: img.width,
      height: img.height,
      timestamp: post.timestamp
    };
  });
  // update timestamp for pagination
  if (items.length) tumblrBeforeTimestamp = items[items.length-1].timestamp;
  // add items
  addItems(items);
}

function onLoadBitlyData(response) {
  var items = response.data.results.map(function (result) {
    return {
      id: result.aggregate_link,
      url: result.url,
      title: result.summaryTitle,
      text: result.summaryText
    };
  });
  addItems(items);
}

function onLoadFoursquareData(data) {
  if (!data || !data.meta || data.meta.code != 200) {
    addItems([]);
    return;
  }
  var items = data.response.venues.slice(-amounts.foursquare).map(function (venue) {
    var category = venue.categories && venue.categories[0];
    var icon = category && category.icon;
    return {
      id: venue.id,
      title: venue.name,
      url: venue.canonicalUrl,
      image: icon && (icon.prefix + '88' + icon.suffix)
    };
  });
  addItems(items);
}

function onLoadexfmData(data) {
  if (data.status_code != 200) {
    addItems([]);
    return;
  }
  var items = data.songs.map(function (song) {
    return {
      type: 'exfm',
      id: song.id,
      title: song.title,
      text: song.artist + ' - ' + song.album,
      url: song.url,
      image: song.image.large
    };
  });
  addItems(items);
}

/**
  * Receives data from some API, creates HTML for images and updates the layout
  */
var lisById = {};
function addItems(data) {
  --isLoading || $('#loaderCircle').hide();

  // Create HTML for the images.
  var i=0, length=data.length, gridblock;
  for(; i<length; i++) {
    gridblock = data[i];
    var id = gridblock.id;
    var li;
    if (id in lisById) {
      li = lisById[id];
      // already seen this one
      $('#tiles').append(li);
      continue;
    }
    lisById[id] = li = $('<li/>');
    var a = $('<a/>');
    a.attr('href', gridblock.url);
    li.append(a);

    if (gridblock.image) {
      var img = new Image();
      img.src = gridblock.image;
      img.width = 280;
      if (gridblock.height) {
        img.height = Math.round(gridblock.height/gridblock.width*280);
      } else {
        // Fix the layout when the image is loaded
        img.onload = applyLayout;
      }
      a.append(img);
    }

    if (gridblock.title) {
      var h2 = $('<h2/>').html(gridblock.title);
      a.append(h2);
    }

    if (gridblock.text) {
      var p = $('<p/>');
      p.html(gridblock.text);
      var div = $('<div class="overflow"/>');
      div.append(p);
      a.append(div);
    }

    // Add image HTML to the page.
    $('#tiles').append(li);
  }

  // Apply layout.
  applyLayout();
}

$(document).ready(function() {
  // Capture scroll event.
  $(document).bind('scroll', onScroll);

  // Load first data from the API.
  loadData();

  // Reload results on form submit
  $('form.navbar-form').on('submit', function (e) {
    e.preventDefault();
    query = $("#search").val();
    if (history.pushState) {
      var newLocation = location.href.replace(queryRe,
        'query=' + encodeURIComponent(query));
      history.pushState({query: query}, document.title, newLocation);
    }
    clearData();
    loadData();
  });
});
