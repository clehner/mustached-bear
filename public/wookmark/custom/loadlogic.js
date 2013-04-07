    var handler = null;
    var page = 1;
    var isLoading = false;
    var apiURL = 'http://www.wookmark.com/api/json/popular'

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
        dataType: 'jsonp',
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
      var html = '';
      var i=0, length=data.length, gridblock;
      for(; i<length; i++) {
        gridblock = data[i];
        html += '<li>';
		
		
		if (gridblock.image) {
			html += '<img src="'+gridblock.image+'" width="280" height="'+Math.round(gridblock.height/gridblock.width*280)+'">';
		}
		
		/*
		if (gridblock.title) {
			//html += '<h2>'+gridblock.title+'</h2>';
			html += '<h2>This is a very long title so it better fit or else too bad</h2>';
		}
		
		if (gridblock.text) {
			//html += '<p>'+gridblock.text+'</p>';
			html += '<div class="overflow"><p>On a hot day in June 2004, the Pashtun tribesman was lounging inside a mud compound in South Waziristan, speaking by satellite phone to one of the many reporters who regularly interviewed him on how he had fought and humbled Pakistan\'s army in the country\'s western mountains. He asked one of his followers about the strange, metallic bird hovering above him. Less than 24 hours later, a missile tore through the compound, severing Mr. Muhammad\'s left leg and killing him and several others, including two boys, ages 10 and 16. A Pakistani military spokesman was quick to claim responsibility for the attack, saying that Pakistani forces had fired at the compound. That was a lie. <BR><BR>Mr. Muhammad and his followers had been killed by the C.I.A., the first time it had deployed a Predator drone in Pakistan to carry out a \"targeted killing.\" The target was not a top operative of Al Qaeda, but a Pakistani ally of the Taliban who led a tribal rebellion and was marked by Pakistan as an enemy of the state. In a secret deal, the C.I.A. had agreed to kill him in exchange for access to airspace it had long sought so it could use drones to hunt down its own enemies.</p></div></div>';
		}*/
			
        html += '</li>';
      }

      // Add image HTML to the page.
      $('#tiles').append(html);

      // Apply layout.
      applyLayout();
    };

    $(document).ready(new function() {
      // Capture scroll event.
      $(document).bind('scroll', onScroll);

      // Load first data from the API.
      loadData();
    });