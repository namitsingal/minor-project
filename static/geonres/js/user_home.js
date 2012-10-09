$(document).ready(function() {
	$('.tab-link').click(function() {
		$('.tab-link').removeClass('pressed');
		$(this).addClass('pressed');
	});

	$('.lookup.inactive').click(function() {
		$(this).removeClass('inactive');
		var val = this.value;
		this.value = val === '[Enter the country]' ? '' : val;
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
				$('#country-lookup').val($(this).html());
			});
		});
	});

	$('#country-lookup').blur(function() {
		$('#country-suggestions').css({display: 'none'});
	});
});