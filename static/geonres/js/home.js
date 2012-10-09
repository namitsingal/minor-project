$(document).ready(function() {
	$('#btn-homepage-login').click(function() {
		$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
		$('#login-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');
	});

	$(document).keydown(function(e) {
		if(e.keyCode == 27) {
			// close the login box
			$('#overlay').animate({opacity: 0}, 'fast', function() {
				$('#overlay').hide();
			});

			$('#login-box').animate({opacity: 0}, 'fast', function() {
				$('#login-box').hide();
			});
		}
	});

	$('#btn-login').click(function() {
		$('#login-spinner').css({display: 'block'});
		$('#login-status').html('');
		var uname = $('#login-email').val();
		var passwd = $('#login-passwd').val();
		$.ajax({
			url: '/users/login?ajax=1',
			type: 'POST',
			data: {username: uname, password: passwd},
			success: function(data) {
				$('#login-spinner').css({display: 'none'});
				if(data['status'] === 'success') {
					window.location.href = '/';
				}
				else {
					$('#login-status').html('<span class="login-error">' + data['message'] + '</span>');
				}
			}
		});
	});
});