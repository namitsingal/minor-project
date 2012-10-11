/* Author: 

*/

currentTracksPage  =  0;
currentArtistsPage = 0;
marker = 0;
google.load("swfobject", "2.1");
params = {allowScriptAccess:"always",wmode:'transparent'};
atts = {id: "ytplayer"};
swfobject.embedSWF("http://www.youtube.com/e/JByDbPn6A1o?version=3&enablejsapi=1&autoplay=0","ytapiplayer", "568", "320", "8", null, null, params, atts);
stateIntro = true;

function setupMap() {
	var geocoder = new google.maps.Geocoder();
	var marker = 0;
	var latlng = new google.maps.LatLng(0, 0);
	var myOptions = {zoom: 2, center: latlng, mapTypeId: google.maps.MapTypeId.ROADMAP};
	var map = new google.maps.Map( document.getElementById('maps'), myOptions);
	
	google.maps.event.addListener(map, 'click', function(event) {	
		geocoder.geocode({'latLng': event.latLng}, function(results, status) {
			country = results[results.length - 1].formatted_address;
			if(marker != 0) marker.setMap(null);
			marker = new google.maps.Marker({
						position: event.latLng, 
						map: map,
						title:country});

			currentArtistsPage = 1;
			$('#top-artists-container').html( 
				'<img src="' + staticUrl + 'img/spinner.gif" class="spinner-icon spinner-icon-hidden"/>' );
			$('#top-artists-container .spinner-icon').removeClass( 
				'spinner-icon-hidden' );
			loadArtists();
		});
	});
}

function init() {	
	setupMap();

	// Setup up inifinite scrolling
	$('#videolist').scroll(function(event) {
		position = this.scrollHeight - this.scrollTop;

		if(position < 320) {
			loadMoreTracks();
		}
	});

	$('#top-artists-container').scroll(function(event) {
		position = this.scrollHeight-this.scrollTop;
		if(position < 146) {
			loadMoreArtists()
		}
	});
}

/* Document Init */
$(document).ready(function() {
	staticUrl = $('#static-url').val();

	$( '#browse-map' ).click( function() {
		//	$("#player" ).css('opacity','0');
			$( '#ytplayer' ).css( 'opacity', '0' );
			$( '#maps' ).css( 'opacity', '1' );
			$( '#player-tab-head' ).css( 'opacity', '0' );
			$( '#map-tab-head' ).css('opacity', '1');				
			$( '#view-container .tab' ).css( { 
				'-webkit-transform': 'translate(0px, 0)',
				'-moz-transform': 'translate(0px, 0)' });
	} );

	$("#watch-video" ).click(function() {
		$("#maps" ).css('opacity','0');
			$("#ytplayer" ).css('opacity','1');
			//$("#player" ).css('opacity','1');
			$("#player-tab-head" ).css('opacity','1');
			$("#map-tab-head" ).css('opacity','0');				
			$("#view-container .tab" ).css( { 
				'-webkit-transform': 'translate(-568px, 0)',
				'-moz-transform': 'translate(-568px, 0)' });
	} );
	
	init();
} );

function loadArtists(callback) {
	var markup = '';
	var url = '/api/artists/' + encodeURI(country) + '/' + currentArtistsPage + '?format=json';
	$.get(url, function(data) {
		for(i in data.artists) {
			var artist_name = data.artists[i].name;
			markup += '<a href=#" id="' + artist_name +'" class="artist-link">' +
				'<div class="artist-item">' +
					'<p class="artist-title">' + artist_name + '</p>' +
					'<img class="play-icon play-icon-hidden" src="' + staticUrl + 'img/play.png"/>' +
				'</div>' +
			'</a>'
		}
	
		$('#top-artists-container').append(markup);
		$('#top-artists-container .spinner-icon').addClass('spinner-icon-hidden');
		$('#top-artists-container').scrollTop = 0;
		$('#top-artists-container').scroll(0);
	
		$('.artist-link').click(function() {
			artist = this.id;
			$.get('/api/details/artist/' + encodeURI(artist) + '?format=json', function(data) {
				$('#artist-bio').html(('<img class="artist-bio-image vid-thumb" src="' + data['details']['image_large'] + '">' +
					'<p>' + data['details']['bio'] + '</p>'));
			});
		
			$('#videolist').html('<img src="' + staticUrl + 'img/spinner.gif" class="spinner-icon spinner-icon-hidden"/>');
			$('#videolist .spinner-icon').removeClass('spinner-icon-hidden');
			$('#top-artists-container .play-icon').addClass('play-icon-hidden');
			$(this).children('.artist-item').children('.play-icon').removeClass('play-icon-hidden');
			$('#state').html('music by ' + artist);
			currentTracksPage = 1;
			loadTracks(function() {
				$( '.vid-links' ).first().click();
			});				
		});

		if(callback) callback();
	});
}

function loadTracks(callback) {
	var markup = '';
	var url = '/api/videos/' + encodeURI(artist) + '/' + currentTracksPage + '?format=json';
	$.get(url, function(data) {
		for(i in data.videos) {
			var item = data.videos[i];
			markup += '<a class="vid-links" href="#" id="' + item.id + '">' +
				'<div class="vid-item">' +
					'<img class="vid-thumb" src="'+ item.thumb_url + '"/>' + 
					'<p class="vid-title">' + item.title+ '</p>' + 
					'<img class="play-icon play-icon-hidden" src="' + staticUrl + 'img/play.png"/>' +
				'</div>' +
			'</a>';
		}
		
		$('#videolist').append(markup);
		$('#videolist .spinner-icon').addClass('spinner-icon-hidden');
		document.getElementById('videolist').scrollTop = 0;
		$('.vid-links').click(function() {
			$('#videolist .play-icon').addClass('play-icon-hidden');
			$(this).children('.vid-item').children('.play-icon').removeClass('play-icon-hidden');
			nowplayingid = this.id;
			ytplayer.loadVideoById(nowplayingid);
			$('#watch-video').click();
		});

		if(callback) callback();
	});
}

function loadMoreTracks() {
	currentTracksPage++;
	loadTracks();
}

function loadMoreArtists() {
	currentArtistsPage++;
	loadArtists();
	/*var callback = function(markup) {
		$('#state').html("music by " + artist);
		$("#top-artists-container").append(markup);

		/*$("#videolist" ).load("/topmusic.php?page="+currentTracksPage+"&artist="+encodeURI(artist),function()
		{
			document.getElementById("videolist").scrollTop = 0;
			$(".vid-links" ).click(function()
			{
				$("#videolist .play-icon" ).addClass("play-icon-hidden");
				$(this ).children(".vid-item").children(".play-icon").removeClass("play-icon-hidden");
				nowplayingid = this.id;
				ytplayer.loadVideoById(nowplayingid );
				$("#watch-video" ).click();
			} );
			$(".vid-links" ).first().click();
		});

		$(".artist-link" ).click(function() {
			$("videolist").html('<img src="spinner.gif" class="spinner-icon spinner-icon-hidden"/>');
			$("#videolist .spinner-icon" ).removeClass("spinner-icon-hidden");
			$("#top-artists-container .play-icon" ).addClass("play-icon-hidden");
			$(this ).children(".artist-item").children(".play-icon").removeClass("play-icon-hidden");
			artist = this.id;
		});
		*/


	loadArtists();
	//TODO load more artists using AJAX pass the page to load(next 5 ) and store the page retrived in currentTracksPage
}

function playnextvideo() {
	next = $( '#' + nowplayingid ).next();
	if( next ) next.click();
}

function onstatechangelistener( state ) {
	if( state==0 ) playnextvideo();
}

function onYouTubePlayerReady() {
	ytplayer = document.getElementById( 'ytplayer' );
	ytplayer.addEventListener( 'onStateChange', 'onstatechangelistener' );
}