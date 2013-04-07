var handler = null;
var page = 0;
var isLoading = 0;
var apiURL = '/result';
var parselyAPIURL = 'http://hack.parsely.com/hackapi/search';
var oEmbedAPIURL = 'http://api.embed.ly/1/oembed';
var query = '';
var imageUrlRe = /"image_url":(".*(?:\/\/)*")/;

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
  $('#tiles').empty();
}

/**
  * Loads data from the API.
  */
function loadData() {
  isLoading++;
  $('#loaderCircle').show();

  $.ajax({
    url: apiURL,
    dataType: 'json',
    data: {
      query: query,
      page: page
    },
    success: onLoadData
  });

  isLoading++;
  $.ajax({
    url: parselyAPIURL,
    dataType: 'jsonp',
    data: {
      apikey: 'arstechnica.com',
      q: query,
      page: page+1
    },
    success: onLoadData2
  });

}

/**
  * Receives data from an API
  */
function onLoadData(data) {
  // Increment page index for future calls.
  page++;
  addItems(data);
}

/**
  * Receives data from parsely API
  */
function onLoadData2(data) {
  var items = data.data.map(function (doc) {
    // sometimes the JSON is fail, so use a regex to get the image url
    var image = doc.image_url;
    if (!image) {
      var matches = doc.metadata.match(imageUrlRe);
      image = matches && JSON.parse(matches[1]);
    }
    return {
      id: doc.pub_date,
      url: doc.url,
      title: doc.title,
      image: image
    };
  });
  var urls = items.map(function (item) { return item.image || item.url; });

  // Get thumbmail urls using embedly
  /*
  $.ajax({
    url: oEmbedAPIURL + '?maxwidth=280&urls=' + urls.map(escape).join(','),
    dataType: 'jsonp',
    success: function (embeds) {
      embeds.forEach(function (embed, i) {
        var item = items[i];
        item.image = embed.thumbnail_url;
        item.width = embed.thumbnail_width;
        item.height = embed.thumbnail_height;
      });
      addItems(items);
    }
  });
  */
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
    clearData();
    loadData();
  });
});
