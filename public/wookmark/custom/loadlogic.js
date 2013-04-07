    var handler = null;
    var page = 0;
    var isLoading = false;
    var apiURL = '/result';

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
    };

    /**
     * Refreshes the layout.
     */
    function applyLayout() {
      // Create a new layout handler.
      handler = $('#tiles li');
      handler.wookmark(options);
    };

    /**
     * Loads data from the API.
     */
    function loadData() {
      isLoading = true;
      $('#loaderCircle').show();

      $.ajax({
        url: apiURL,
        dataType: 'json',
        data: {page: page}, // Page parameter to make sure we load new data
        success: onLoadData
      });
    };

    /**
     * Receives data from the API, creates HTML for images and updates the layout
     */
    function onLoadData(data) {
      isLoading = false;
      $('#loaderCircle').hide();

      // Increment page index for future calls.
      page++;

      // Create HTML for the images.
      var i=0, length=data.length, gridblock;
      for(; i<length; i++) {
        gridblock = data[i];
        var li = $('<li/>');

        if (gridblock.image) {
          var img = new Image();
          img.src = gridblock.image;
          img.width = 280;
          img.height = Math.round(gridblock.height/gridblock.width*280);
          li.append(img);
        }

        if (gridblock.title) {
          var h2 = $('<h2/>').text(gridblock.title);
          li.append(h2);
        }

        if (gridblock.text) {
          //html += '<p>'+gridblock.text+'</p>';
          var p = $('<p/>');
          p.html(gridblock.text);
          var div = $('<div class="overflow"/>')
          li.append(div);
          div.append(p);
        }

        // Add image HTML to the page.
        $('#tiles').append(li);
      }

      // Apply layout.
      applyLayout();
    };

    $(document).ready(new function() {
      // Capture scroll event.
      $(document).bind('scroll', onScroll);

      // Load first data from the API.
      loadData();
    });
