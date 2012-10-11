
function check()
{ //alert(document.forms["registers"]["username"].value);
  if(document.forms["registers"]["username"].value==null || document.forms["registers"]["username"].value=="")
  { alert('Please fill in a username');
    return false;
  }
  if(document.forms["registers"]["passwords"].value != document.forms["registers"]["cpassword"].value || (document.forms["registers"]["passwords"].value==null || document.forms["registers"]["passwords"].value==""))
  { alert('both passwords dont match or password field empty');
    return false;
  }
  if(document.forms["registers"]["passwords"].value.length <8)
  {
    alert('password length should be greater than 8');
    return false;
  }
  return true;
  
}
function register()
{
 

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
					var x=parseInt($('#login-box').css("height"));
					alert(x);
					$('#login-box').css("height",x+20);
				}
			}
		});
	});
});