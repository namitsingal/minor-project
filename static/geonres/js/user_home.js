currentArtistsPage = 1;
var staticUrl = '';
var loadedArtists = [];

function loadArtistDetails(id) {
	var index = id;
	var name = loadedArtists[index].name;
	$.get('/api/details/artist/' + encodeURI(artist) + '?format=json', function(data) {
		loadedArtists[index]['small_image'] = data.details.image_small;
		loadedArtists[index]['large_image'] = data.details.image_large;
		loadedArtists[index]['bio'] = data.details.bio;
		$('#' + index + ' .vid-thumb').attr('src', data.details.image_small);
		if(loadedArtists[index]['callback']) {
			loadedArtists[index]['callback']();
		}
	});

}

function loadTracks(artist) {
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
		
		$('#track-select-container').append(markup);
		$('#track-select-container .spinner-icon').addClass('spinner-icon-hidden');
		document.getElementById('track-select-container').scrollTop = 0;
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

function loadArtists(country, filter, filterValue, callback) {
	var markup = '';
	var url = '/api/artists/' + encodeURI(country) + '/' + currentArtistsPage + '?format=json';
	$.get(url, function(data) {
		var init = loadedArtists.length;
		for(i in data.artists) {
			var artist_name = data.artists[i].name;
			loadedArtists.push({name: artist_name});
			var id = loadedArtists.length - 1;
			$('#artist-list').append('<a href="#" id="' + artist_name +'" class="artist-link">' +
				'<div id="' + id + '" class="artist-item">' +
					'<img class="vid-thumb" src="' + staticUrl + 'img/loading.png">' +
					'<p class="artist-title">' + artist_name + '</p>' +
					'<img class="play-icon play-icon-hidden" src="' + staticUrl + 'img/play.png"/>' +
				'</div>' +
			'</a>');
			loadArtistDetails(id);
		}

		$('#artist-list .spinner-icon').addClass('spinner-icon-hidden');
		$('#artist-list').scrollTop = 0;
		$('#artist-list').scroll(0);
	
		$('.artist-link').click(function() {
			/*$('#videolist').html('<img src="' + staticUrl + 'img/spinner.gif" class="spinner-icon spinner-icon-hidden"/>');
			$('#videolist .spinner-icon').removeClass('spinner-icon-hidden');
			$('#top-artists-container .play-icon').addClass('play-icon-hidden');
			$(this).children('.artist-item').children('.play-icon').removeClass('play-icon-hidden');
			artist = this.id;
			$('#state').html('music by ' + artist);
			currentTracksPage = 1;
			loadTracks(function() {
				$( '.vid-links' ).first().click();*/
			var id = $(this).find('.artist-item').attr('id');
			$('html, body').animate({scrollTop: $('#track-select-container').offset().top}, 1000);

			var loadBio = function() {
				$('#artist-bio').html(('<img class="artist-bio-image vid-thumb" src="' + loadedArtists[id]['large_image'] + '">' +
					'<p>' + loadedArtists[id]['bio'] + '</p>'));

			};

			if(loadedArtists[id]['large_image']) {
				loadBio();
			}
			else {
				loadedArtists[id]['callback'] = loadBio;
			}

			loadTracks()
		});				

		if(callback) callback();
	});
}

$(document).ready(function() {
	staticUrl = $('#static-url').val();
	$('.tab-link').click(function() {
		$('.tab-link').removeClass('pressed');
		$(this).addClass('pressed');
	});

	$('body').delegate('#btn-edit-profile', 'click', function() {
		window.location = '/users/register';
	});

	$('.lookup.inactive').click(function() {
		$(this).removeClass('inactive');
		var val = this.value;
		var def = $(this).attr('data-default');
		this.value = val === def ? '' : val;
	});

	$('#country-lookup').keydown(function() {
		var key = $(this).val();
		$('#country-suggestions').css({display: 'block'});
		var markup = '';
		if(key == '') return;
		$.get('/api/suggestions/countries/' + $(this).val() + '?format=json', function(data) {
			var countries = data.countries;
			for(i in countries) {
				markup += ('<p><a href="#" class="country-suggestion">' + countries[i] + '</a></p>');
			}
			$('#country-suggestions').html(markup);

			$('.country-suggestion').click(function() {
				var country = $(this).html();
				$('#country-lookup').val(country);
				$('#artist-list').html('');
				loadArtists(country);
			});
		});
	});

	$("#container").click(function() {
		$('#country-suggestions').css({display: 'none'});
	});

	$('#map').click(function() {
		$('#state').hide();
	})
});