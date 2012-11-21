
function songadded(){
	$('#overlay').animate({opacity: 0}, 'fast', function() {
				$('#overlay').hide();
			});

			$('#login-box').animate({opacity: 0}, 'fast', function() {
				$('#login-box').hide();
			});
			$('#register-box').animate({opacity: 0}, 'fast', function() {
				$('#register-box').hide();

			});
			$('#playlist-box').animate({opacity: 0}, 'fast', function() {
				$('#playlist-box').hide();
			});
			$('#add-song-box').animate({opacity: 0}, 'fast', function() {
				$('#add-song-box').hide();
			});
}


function check() { //alert(document.forms["registers"]["username"].value);
	var message = '';
	var state = true;
	if(document.forms["registers"]["username"].value==null || document.forms["registers"]["username"].value=="") {
		message = 'Please fill in a username';
		state = false;
	}
	else if(document.forms["registers"]["passwords"].value != document.forms["registers"]["cpassword"].value || (document.forms["registers"]["passwords"].value==null || document.forms["registers"]["passwords"].value==""))
	{ 
		message = 'Both passwords dont match or password field empty';
		state = false;
	}
	else if(document.forms["registers"]["passwords"].value.length <8) {
		message = 'Password length should be greater than 8.';
		state = false;
	}
	else
	{
		var uname = $('#register-uname').val();
		var passwd = $('#register-passwd').val();
		var mail = $('#register-email').val();
		$.ajax({
				url: '/users/register',
				type: 'POST',
				data: {username: uname,passwords:passwd,email:mail},
				success: function(data) {
					//$('#login-spinner').css({display: 'none'});
					if(data['status'] === 'success') {
						var k=1;
						alert('registered successfully');
						window.location.href='/'
						//window.location.reload(forceGet);
						return true;
						state=true;
					}
					else {
						message = data['message'];
						state = false;
					}
				if(state == true) { return true; }
				else {
					$('#registration-status').html('<span class="login-error">' + message + '</span');
					var x = parseInt($('#register-box').css("height"));
					$('#register-box').animate({"height": x + 25}, 'fast');
					return false;
					}
				}
			});
	}
	if(state == true) { return true; }
	else {
		$('#registration-status').html('<span class="login-error">' + message + '</span');
		var x = parseInt($('#register-box').css("height"));
		$('#register-box').animate({"height": x + 25}, 'fast');
		return false;
	}
    
}

function register() {
	$('#login-box').animate({opacity: 0}, 'fast', function() {
	$('#login-box').hide();
	});

    $('#register-box').css({opacity: 0}).show().animate({opacity: 1}, 'slow');    
}

$(document).ready(function() {
	$('#signup').click(function()	{
		$('#login-box').animate({opacity: 0}, 'fast', function() {
        $('#login-box').hide();
      });

    $('#register-box').css({opacity: 0}).show().animate({opacity: 1}, 'slow');
	});


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
			$('#register-box').animate({opacity: 0}, 'fast', function() {
				$('#register-box').hide();

			});
			$('#playlist-box').animate({opacity: 0}, 'fast', function() {
				$('#playlist-box').hide();
			});
			$('#discussion-box').animate({opacity: 0}, 'fast', function() {
				$('#discussion-box').hide();
			});
			$('#discussion1-box').animate({opacity: 0}, 'fast', function() {
				$('#discussion1-box').hide();
			});
			$('#add-song-box').animate({opacity: 0}, 'fast', function() {
				$('#add-song-box').hide();
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
					var x = parseInt($('#login-box').css("height"));
					$('#login-box').animate({"height": x + 20}, 'fast');
				}
			}
		});
	});
});