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
add_url = '';
add_title = '';
add_id = '';

var friendHeader = "<div id='header-friend'><ul>" +
		"<li><a id= 'friend-container' class = 'friend-head' href='#'>Friends</a></li>" +
		"<li><a id='request-container' class = 'friend-head' href='#'>Requests</a></li>" +
		"<li><a id='finder-container' class = 'friend-head' href='#'>Find people</a></li>" +
		"</li></div>";

function requestStart() {
	$('#loading').show();
}

function requestComplete() {
	$('#loading').hide();
}

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

function getplaylist(){
	var url='/users/show_playlist';
	$('#playlist1').html('');

	requestStart();
	$.get(url,function(data){
		requestComplete();
		markup="";
		for (i in data.player){
			var playlist_name = data.player[i].playlist;
			//alert(playlist_name);
			markup += "<div id='list-container'><a href='#' id='"+playlist_name+"' class='lists'>"+ playlist_name + "</a></div>";
			
			}
			$('#playlist1').html(markup);

			$('.lists').click(function(){
				//alert('I am here');
				$('#playlist1').html('');
				var kk=this.id;
				//alert(kk);
				requestStart();
				$.ajax({
				url: '/users/show_songs',
				type: 'POST',
				data: {name: kk},
				success: function(data) {
					requestComplete();
					var k=0;
					for(ii in data.player){
						k++;
						markup = '<a class="vid-links1" name="'+kk+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
						$('#playlist1').append(markup);
					}	
					if(k==0)
					{
						markup="<div id='list-container1'><p>No Songs in Playlist</p></div>";
						$('#playlist1').html(markup);
					}	
				$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});
		markup = '<a id="newbutton1" href="#" class="buttons1" >Create Playlist</a>'
		$('#playlist1').append(markup);
		$('#newbutton1').click(function(){
			$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
			$('#playlist-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');		
		});

	});

}

function loadDiscussion(genre,name1){

	$('#playlist1').html('');
	requestStart();
	$.ajax({
		url: '/users/show_topics1',
		type: 'POST',
		data: {name: name1, play:genre},
		success: function(data) {
			requestComplete();
			markup = "<div id = 'list-container'><a class='lists_discussions111'>"+name1+"</a></div><div id = 'all-comments'>";
			$('#playlist1').append(markup);
			for (ii in data.player){
				markup = "<div id='list-container'>"+ data.player[ii].comment + '<p id="topic-list1">------comment by '+data.player[ii].by+'--------</p></div>';
			$('#all-comments').append(markup);
			}
			markup = "</div><textarea id = 'comment-discussion' class= 'comment-box'></textarea>"
			markup += "<a href='#' class='comment-submit' name='"+name1+"' id='"+genre+"'>Comment</a>";
			$('#playlist1').append(markup);
			$('.comment-submit').click(function(){
				var genre=this.id;
				var name1=this.name;
				var comment1=$('#comment-discussion').val();
				if(comment1=='')
					alert('comment cannot be empty');
				else
				{	//var markup = "<div id='list-container'>"+ comment1 + "</div>";
					//$('#all-comments').append(markup);
					requestStart();
					$.ajax({
						url:'/users/add_comment',
						type:'POST',
						data:{name:name1,play:genre,comment:comment1},
						success: function(data) {
							requestComplete();
							//alert(data.user.name);
							var markup = "<div id='list-container'>"+ comment1 + "</div>";
							$('#all-comments').append(markup);
						}
				});
				}

			});
		}

	});
}

function getdiscussions(){
	var url='/users/show_discussion';
	$('#playlist1').html('');

	requestStart();
	$.get(url,function(data){
		requestComplete();
		for (i in data.player){
			var playlist_name = data.player[i].playlist;
			//alert(playlist_name);
			markup = "<div id='list-container'><a href='#' id='"+playlist_name+"' class='lists_discussions'>"+ playlist_name + "</a></div>";
			$('#playlist1').append(markup);

			}

			$('.lists_discussions').click(function(){
				//alert('I am here');
				$('#playlist1').html('');
				var kk=this.id;
				//alert(kk);
				requestStart();
				$.ajax({
				url: '/users/show_topics',
				type: 'POST',
				data: {name: kk},
				success: function(data) {
					requestComplete();
					var temp=0;
					for(ii in data.player){
						temp++;
						markup="<div id='list-container'>"
						markup += '<a class="lists_discussions1" name="'+kk+'" href="#" id="'+data.player[ii].title+'"><span id="topic-width">'+data.player[ii].title+'</span><p id="topic-list">started by '+data.player[ii].by+'</p></a></div>';
						$('#playlist1').append(markup);
					}		
					if(temp==0)
					{	markup= "<p>No Topics Created, Be the First one to create</p>";
						$('#playlist1').append(markup);
					}
					markup = '<a id="newbutton2" href="#" class="buttons1" name="'+kk+'">Create Topic</a>'
					$('#playlist1').append(markup);
					$('#newbutton2').click(function(){
						$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
						$('#discussion-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');		
					});

				$('.lists_discussions1').click(function() {		
							loadDiscussion(this.name,this.id);
							
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});
		markup = '<a id="newbutton1" href="#" class="buttons1" >Create Genre</a>'
		$('#playlist1').append(markup);
		$('#newbutton1').click(function(){
			$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
			$('#discussion1-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');		
		});

	});

}

function getfriends(element){
	var url='/users/show_friends';
	$('#playlist1').html(friendHeader);

	$('#friend-container').click(function(){
		getfriends($('#playlist1'));
	});
	
	$('#request-container').click(function(){
		getrequests();
	});
	
	$('#finder-container').click(function(){
		getfind();
	});

	requestStart();
	$.get(url,function(data){
		requestComplete();
		var j=1;
		for (i in data.player){
			j=j+1;
			var playlist_name = data.player[i].playlist;
			//alert(playlist_name);
			markup = "<div id='list-container11'><a href='#' id='"+playlist_name+"' class='lists1'>"+ playlist_name + "</a></div>";
			$('#playlist1').append(markup);

			}
			if(j==1){
			markup = "<div id='list-container1'><p>No Friends</p></div>";
			element.append(markup);
			}

			$('body').delegate('.lists1', 'click', function(){
				//alert('I am here');
				$('#playlist1').html('');
				var kk=this.id;
				//alert(kk);
				requestStart();
				$.ajax({
				url: '/users/show_profile?id='+kk,
				type: 'GET',
				success: function(data) {
					requestComplete();
					//for(ii in data.player){
					//	markup = '<a class="vid-links1" name="'+kk+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
					//	$('#playlist1').append(markup);
					$('#playlist1').html(data);

					$('#btn-add-friend').click(function(){
						k=this.name;
						kk=this;
						//alert($(this).html());
						//alert(k);
						requestStart();
						$.ajax({
							url:'/users/add_as_friend',
							type: 'POST',
							data: {name:k},
							success: function(data){
								requestComplete();
								$(kk).html('Request sent');
								$('#btn-add-friend').unbind('click');
								alert('friend request sent');
							}

							});	
						});

					$('.lists').click(function(){

				//alert('I am here');
				//$('#playlist1').html('');
				var kk=this;
				//alert(kk);
				$.ajax({
				url: '/users/show_songs1',
				type: 'POST',
				data: {name: kk.id, user1:kk.name},
				success: function(data) {
					$(".hideall").html('');
					var k=0;
					for(ii in data.player){
						k++;
						markup = '<a class="vid-links1" name="'+kk.id+'" href="#" id="'+data.player[ii].id+'" data-url="'+kk.name+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
						$('.'+ kk.id).append(markup);
					}	
					//alert(kk.id);
					if(k==0)
					{
						markup="<div id='list-container1'><p>No Songs in Playlist</p></div>";
						$('.'+kk.name).html(markup);
					}	
				$('.vid-links1').click(function() {		
							//alert(this.getAttribute('data-url'));
							loadTracks111(this.name,this.id,this.getAttribute('data-url'));
							$('#browse').click();
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});
					//}		
				/*$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});*/
				//alert('link added');
				}//loadTracks1
			});
				
			});
		/*markup = '<a id="newbutton1" href="#" class="buttons1" >Create Playlist</a>'
		$('#playlist1').append(markup);
		$('#newbutton1').click(function(){
			$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
			$('#playlist-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');		
		});
*/
	});

}

function getrequests(){
	var url='/users/show_requests';
	$('#playlist1').html(friendHeader);

	$('#friend-container').click(function(){
		getfriends($('#playlist1'));
	});
	
	$('#request-container').click(function(){
		getrequests();
	});
	
	$('#finder-container').click(function(){
		getfind();
	});

	requestStart();
	$.get(url,function(data){
		requestComplete();
		var j=1;
		for (i in data.player){
			j=j+1;
			var playlist_name = data.player[i].playlist;
			//alert(playlist_name);
			markup = "<div id='list-container'><a href='#' id='"+playlist_name+"' class='lists1'>"+ playlist_name + "</a><a href='#' class='friend-request11' name='" + playlist_name + "'>Accept</a><a href='#' class='friend-request12' name='" + playlist_name + "'>Reject</a></div>";
			$('#playlist1').append(markup);

			}
		if(j==1){
			markup = "<div id='list-container1'><p>No Friend Requests</p></div>";
			$('#playlist1').append(markup);
		}
		$('.friend-request11').click(function(){
			var k=this;
			//alert(k.name);
			requestStart();
			$.ajax({ url: '/users/addfriend',
					 type: 'POST', 
					 data:{name:k.name},
					 success: function(data){
					 	requestComplete();
					 	alert('Successfully added');
					 	$('#request-container').click();
					 }

			});
		});


		$('.friend-request12').click(function(){
			var k=this;
			requestStart();
			$.ajax({ url: '/users/rejectfriend',
					 type: 'POST', 
					 data:{name:k.name},
					 success: function(data){
					 	requestComplete();
					 	alert('Request declined');
					 	$('#request-container').click();
					 }

			});
		});


		$('.lists1').click(function(){
				//alert('I am here');
				$('#playlist1').html('');
				var kk=this.id;
				//alert(kk);
				requestStart();
				$.ajax({
				url: '/users/show_profile',
				type: 'POST',
				data: {name: kk},
				success: function(data) {
					requestComplete();
						//for(ii in data.player){
					//	markup = '<a class="vid-links1" name="'+kk+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
					//	$('#playlist1').append(markup);
					$('#playlist1').html(data);


					$('#btn-add-friend').click(function(){
						k=this.name;
						kk=this;
						//alert($(this).html());
						//alert(k);
						requestStart();
						$.ajax({
							url:'/users/add_as_friend',
							type: 'POST',
							data: {name:k},
							success: function(data){
								requestComplete();
								$(kk).html('Request sent');
								$('#btn-add-friend').unbind('click');
								alert('friend request sent');
							}

							});	
						});
					$('.lists').click(function(){

				//alert('I am here');
				//$('#playlist1').html('');
				var kk=this;
				//alert(kk);
				$.ajax({
				url: '/users/show_songs',
				type: 'POST',
				data: {name: kk.id},
				success: function(data) {
					$(".hideall").html('');
					var k=0;
					for(ii in data.player){
						k++;
						markup = '<a class="vid-links1" name="'+kk.id+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
						$('.'+ kk.id).append(markup);
					}	
					//alert(kk.id);
					if(k==0)
					{
						markup="<div id='list-container1'><p>No Songs in Playlist</p></div>";
						$('.'+kk.name).html(markup);
					}	
				$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});

					//}		
				/*$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});*/
				//alert('link added');
				}//loadTracks1
			});
				
			});
		

			/*$('.lists').click(function(){
				//alert('I am here');
				$('#playlist1').html('');
				var kk=this.id;
				//alert(kk);
				$.ajax({
				url: '/users/show_songs',
				type: 'POST',
				data: {name: kk},
				success: function(data) {
					
					for(ii in data.player){
						markup = '<a class="vid-links1" name="'+kk+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
						$('#playlist1').append(markup);
					}		
				$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});*/
		/*markup = '<a id="newbutton1" href="#" class="buttons1" >Create Playlist</a>'
		$('#playlist1').append(markup);
		$('#newbutton1').click(function(){
			$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
			$('#playlist-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');		
		});
*/
	});

}

function getfind(){
	var url='/users/show_people';
	$('#playlist1').html(friendHeader);

	$('#friend-container').click(function(){
		getfriends($('#playlist1'));
	});
	
	$('#request-container').click(function(){
		getrequests();
	});
	
	$('#finder-container').click(function(){
		getfind();
	});

	$('#playlist1').append("<p><input placeholder='Search by name' class='input' type='text' id='search_name'></input><div id = 'found1'></div>")
	markup = "<div id='list-container1'><p>(Please Enter Name)</p></div>";
	$('#found1').html(markup);
	$('#search_name').keyup(function(){
		kk=$(this).val();
		if(kk=="")
		{
			markup = "<div id='list-container1'><p>(Please Enter Name)</p></div>";
			$('#found1').html(markup);
		}
		else{
			requestStart();
	$.ajax({
				url: '/users/show_people',
				type: 'POST',
				data: {name: kk},
				success: function(data){
					requestComplete();
			markup="";
			var j=1;
		for (i in data.player){
			j=j+1;
			var playlist_name = data.player[i].playlist;
			//alert(playlist_name);
			markup += "<div id='list-container1'><a href='#' id='"+playlist_name+"' class='lists1'>"+ playlist_name + "</a>";
			if(data.player[i].request==1)
				markup += "<a class='friend-request1' name='" +playlist_name+ "'>Request sent</a></div>";
			else if(data.player[i].friend==1)
				markup += "<a class='friend-request1' name='" +playlist_name+ "'>Already a Friend</a></div>";
			else
				markup+= "<a href='#' class='friend-request' name='" +playlist_name+ "'>Add as Friend</a></div>";

			

			}
			$('#found1').html(markup);

			$('.friend-request').click(function(){
				k=this.name;
				kk=this;
				//alert($(this).html());
				//alert(k);
				requestStart();
			$.ajax({
							url:'/users/add_as_friend',
							type: 'POST',
							data: {name:k},
							success: function(data){
								requestComplete();
								$(kk).html('Request sent');
								$(kk).unbind('click');
								alert('friend request sent');
							}

				});	
			});
		if(j==1){
			markup = "<div id='list-container1'><p>No Person Found</p></div>";
			$('#found1').html(markup);
		}
		$('.lists1').click(function(){
				//alert('I am here');
				$('#playlist1').html('');
				var kk=this.id;
				//alert(kk);
				requestStart();
				$.ajax({
				url: '/users/show_profile?id='+kk,
				type: 'GET',
				
				success: function(data) {
					requestComplete();
										//for(ii in data.player){
					//	markup = '<a class="vid-links1" name="'+kk+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
					//	$('#playlist1').append(markup);
					$('#playlist1').html(data);

					$('#btn-add-friend').click(function(){
						k=this.name;
						kk=this;
						//alert($(this).html());
						//alert(k);
						requestStart();
						$.ajax({
							url:'/users/add_as_friend',
							type: 'POST',
							data: {name:k},
							success: function(data){
								requestComplete();
								$(kk).html('Request sent');
								$('#btn-add-friend').unbind('click');

								alert('friend request sent');
							}

							});	
						});

						$('.lists').click(function(){

				//alert('I am here');
				//$('#playlist1').html('');
				var kk=this;
				//alert(kk);
				$.ajax({
				url: '/users/show_songs1',
				type: 'POST',
				data: {name: kk.id, user1:kk.name},
				success: function(data) {
					$(".hideall").html('');
					var k=0;
					for(ii in data.player){
						k++;
						markup = '<a class="vid-links1" name="'+kk.id+'" href="#" id="'+data.player[ii].id+'" data-url="'+kk.name+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
						$('.'+ kk.id).append(markup);
					}	
					//alert(kk.id);
					if(k==0)
					{
						markup="<div id='list-container1'><p>No Songs in Playlist</p></div>";
						$('.'+kk.name).html(markup);
					}	
				$('.vid-links1').click(function() {		
							//alert(this.getAttribute('data-url'));
							loadTracks111(this.name,this.id,this.getAttribute('data-url'));
							$('#browse').click();
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});	



					//}		
				/*$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});*/
				//alert('link added');
				}//loadTracks1
			});
				
			});
		
		}
	});
	}
});
}

function getprofile(){
	requestStart();
	$.get('/users/show_profile?id=',function(data){
		requestComplete();
		$('#playlist1').html(data);

		$('#btn-add-friend').click(function(){
						k=this.name;
						kk=this;
						//alert($(this).html());
						//alert(k);
						requestStart();
						$.ajax({
							url:'/users/add_as_friend',
							type: 'POST',
							data: {name:k},
							success: function(data){
								requestComplete();
								$(kk).html('Request sent');
								$('#btn-add-friend').unbind('click');
								alert('friend request sent');
							}

							});	
						});


		$('.lists').click(function(){

				//alert('I am here');
				//$('#playlist1').html('');
				var kk=this;
				//alert(kk);
				$.ajax({
				url: '/users/show_songs',
				type: 'POST',
				data: {name: kk.id},
				success: function(data) {
					$(".hideall").html('');
					var k=0;
					for(ii in data.player){
						k++;
						markup = '<a class="vid-links1" name="'+kk.id+'" href="#" id="'+data.player[ii].id+'"><div class="vid-item"><img class="vid-thumb" src="'+data.player[ii].thumb_url+'"><p class="vid-title">'+data.player[ii].title+'</p><img class="play-icon" src="/static/geonres/img/play.png"></div></a>';
						$('.'+ kk.id).append(markup);
					}	
					//alert(kk.id);
					if(k==0)
					{
						markup="<div id='list-container1'><p>No Songs in Playlist</p></div>";
						$('.'+kk.name).html(markup);
					}	
				$('.vid-links1').click(function() {		
							loadTracks1(this.name,this.id);
							$('#browse').click();
						});
				//alert('link added');
				}//loadTracks1
			});
				
			});
	});
}

/* Document Init */
$(document).ready(function() {
	
	/*$('#logout').click(function(){
		window.location.replace('/users/logout1');
	})*/

	//$('#loading').show();
	$('#btn-playlist').click(function(){
		$('#playlist-spinner').css({display: 'block'});
		$('#playlist-status').html('');
		var k=$('#playlist-name').val();
		if(k==''||k==null)
		{	alert('Playlist Name cannot be empty');
			return;
		}
		else{
			requestStart();
			$.ajax({
				url: '/users/create_playlist',
				type: 'POST',
				data: {name: k},
				success: function(data) {
					requestComplete();
					$('#playlist-spinner').css({display: 'none'});
					if(data['status'] === 'success') {
						
						$('#playlist-box').animate({opacity: 0}, 'fast', function() {
						$('#playlist-box').hide();
						});
						$('#overlay').animate({opacity: 0}, 'fast', function() {
						$('#overlay').hide();
						});
						getplaylist();
					}
					else {
						$('#playlist-status').html('<span class="login-error">' + data['message'] + '</span>');
						var x = parseInt($('#playlist-box').css("height"));
						if(x<221)
						$('#playlist-box').animate({"height": x + 20}, 'fast');
					}
				}
			});
		}
	});

$('#btn-discussion').click(function(){
		//$('#discussion-spinner').css({display: 'block'});
		$('#discussion-status').html('');
		var k=$('#discussion-name').val();
		if(k==''||k==null)
		{	alert('Topic cannot be empty');
			return;
		}
		else{
		$('#discussion-spinner').css({display: 'block'});

		var na=$('#newbutton2').attr('name');
		//alert(na);
			requestStart();
			$.ajax({
				url: '/users/create_topic',
				type: 'POST',
				data: {name: k,play: na},
				success: function(data) {
					requestComplete();
					$('#discussion-spinner').css({display: 'none'});
					if(data['status'] === 'success') {
						
						$('#discussion-box').animate({opacity: 0}, 'fast', function() {
						$('#discussion-box').hide();
						});
						$('#overlay').animate({opacity: 0}, 'fast', function() {
						$('#overlay').hide();
						});
						getdiscussions();
					}
					else {
						$('#discussion-status').html('<span class="login-error">' + data['message'] + '</span>');
						var x = parseInt($('#discussion-box').css("height"));
						if(x<221)
						$('#discussion-box').animate({"height": x + 20}, 'fast');
					}
				}
			});
		}
	});

	$('#btn-discussion1').click(function(){
		//$('#discussion-spinner').css({display: 'block'});
		$('#discussion1-status').html('');
		var k=$('#discussion1-name').val();
		if(k==''||k==null)
		{	alert('Discussion cannot be empty');
			return;
		}
		else{
		$('#discussion1-spinner').css({display: 'block'});

		//var na=$('#newbutton2').attr('name');
		//alert(na);	
			$.ajax({
				url: '/users/create_genre',
				type: 'POST',
				data: {name: k},
				success: function(data) {
					$('#discussion1-spinner').css({display: 'none'});
					if(data['status'] === 'success') {
						
						$('#discussion1-box').animate({opacity: 0}, 'fast', function() {
						$('#discussion1-box').hide();
						});
						$('#overlay').animate({opacity: 0}, 'fast', function() {
						$('#overlay').hide();
						});
						getdiscussions();
						alert('Genre Created');
					}
					else {
						$('#discussion1-status').html('<span class="login-error">' + data['message'] + '</span>');
						var x = parseInt($('#discussion1-box').css("height"));
						if(x<221)
						$('#discussion1-box').animate({"height": x + 20}, 'fast');
					}
				}
			});
		}
	});

	staticUrl = $('#static-url').val();
	
	$('#playlist1').animate({opacity:0},1);
	$('#playlist1').hide();
	$('#playlist-spinner').hide();

	$('#playlist').click(function(){
		$('#tab-browse').css({visibility: 'hidden'});
		$('#playlist1').animate({opacity:1},1);
		$('#playlist1').show();
		getplaylist();

	});

	$('#friend').click(function(){
		$('#tab-browse').css({visibility: 'hidden'});
		$('#playlist1').animate({opacity:1},1);
		$('#playlist1').show();
		getfriends($('#playlist1'));
	});

	$('#browse').click(function(){
		$('#tab-browse').css({visibility: 'visible'});
		$('#playlist1').animate({opacity:0});
		$('#playlist1').hide();

	});

	$('#profile').click(function(){
		$('#tab-browse').css({visibility: 'hidden'});
		$('#playlist1').animate({opacity:1},1);
		$('#playlist1').show();
		getprofile();
	});

	$('#discussion').click(function(){
		$('#tab-browse').css({visibility: 'hidden'});
		$('#playlist1').animate({opacity:1},1);
		$('#playlist1').show();
		getdiscussions();
	});

	$(document).click(function(){
		$('.menu').hide();
	});
	
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
	var url = '/api/artists/' + encodeURI(country) + '/' + currentArtistsPage + '?format=xml';
	$.get(url, function(data) {
		var elements = data.getElementsByTagName('item');
		for(var i=0, j=elements.length; i<j; i++) {
			var element = elements[i];
			var artist_name = element.getElementsByTagName('name')[0].childNodes[0].nodeValue;
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
			$.get('/api/details/artist/' + encodeURI(artist) + '?format=xml', function(data) {
				var large_image = data.getElementsByTagName('image_large')[0].childNodes[0].nodeValue;
				var small_image = data.getElementsByTagName('image_small')[0].childNodes[0].nodeValue;
				var bio = data.getElementsByTagName('bio')[0].childNodes[0].nodeValue;
				$('#artist-bio').html(('<img class="artist-bio-image vid-thumb" src="' + large_image + '">' +
					'<p>' + bio + '</p>'));
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

function getplaylist1() {
	var url='/users/show_playlist';
	$('#add-song-box').html('');

	requestStart();
	$.get(url,function(data){
		requestComplete();
		for (i in data.player){
			
			var x = parseInt($('#add-song-box').css("height"));
			$('#add-song-box').animate({"height": x + 50}, 'fast');
			var playlist_name = data.player[i].playlist;
			//alert(playlist_name);
			markup = "<div id='list-container' class='lists-add'><input name='play-list' type='radio' id='"+playlist_name+"' class='lists-add' value='"+playlist_name+"'>"+ playlist_name + "</input></div>";
			$('#add-song-box').append(markup);
			}
		markup = '<a id="addsong" href="#" class="addsong" >Add to Playlist</a>';
		$('#add-song-box').append(markup);
		$('#addsong').click(function(){
			var k= $('.lists-add:checked').val();
			if(k){
				requestStart();
				$.ajax({
				url: '/users/add_song',
				type: 'POST',
				data: {name: k, song_id: add_id, thumb_url:add_url, title1: add_title},
				success: function(data) {
					requestComplete();
					if(data['status'] === 'success') {
						songadded();
						alert('Song added');

						
					}
					else {
						songadded();
						alert('Song  already in playlist');
					}
					}
				});
				}
			else{
				alert('Select 1 playlist');
				}
		});
});
}

function loadTracks(callback) {
	var markup = '';
	var markup1 = '';
	var url = '/api/videos/' + encodeURI(artist) + '/' + currentTracksPage + '?format=xml';
	$.get(url, function(data) {
		var elements = data.getElementsByTagName('item');
		for(var i=0, j=elements.length; i<j; i++) {

			var element = elements[i];
			var title = element.getElementsByTagName('title')[0].childNodes[0].nodeValue;
			var id = element.getElementsByTagName('id')[0].childNodes[0].nodeValue;
			var thumb_url = element.getElementsByTagName('thumb_url')[0].childNodes[0].nodeValue;

			markup1 = '<div style="border: 1px solid rgb(0, 0, 0); padding: 10px; display: none; position: absolute; background-color: rgb(238, 238, 238);" class="menu" id="' + id + '">Add to playlist</div>';
			markup = '<a class="vid-links" href="#" id="' + id + '">' +
				'<div class="vid-item">' +
					'<img class="vid-thumb" src="'+ thumb_url + '" id="' + id + '" />' + 
					'<p class="vid-title" id="'+ id + '">' + title+ '</p>' + 
					'<img class="play-icon play-icon-hidden" src="' + staticUrl + 'img/play.png"/>' +
				'</div>' +
			'</a>';

					$('#videolist').append(markup);
		$('#videolist').append(markup1);

		$('#'+ id + '.menu').click(function(){

			var k = this;
			//alert(k.id);
			requestStart();
			$.get('/users/check', function(data) {
				requestComplete();
				if(data=='true')
					{	
						console.log('logged in');
						add_url = $('#'+k.id+'.vid-thumb').attr("src");
						add_title  = $('#'+k.id +'.vid-title').html();
						add_id = k.id;
						$('#add-song-box').html('');
						$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
						
						$('#add-song-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');
						getplaylist1();
						
						//alert(title);
						//alert(this.id);
						//alert($("#"+this.id+".vid-links").children('.vid-item').children('.vid-thumb')['src']);
					}
				else
				{
					$('#btn-homepage-login').click();
				}
			});


		});

		}
		$('#videolist .spinner-icon').addClass('spinner-icon-hidden');
		document.getElementById('videolist').scrollTop = 0;
		$('.vid-links').bind("contextmenu", function(e) {
			$('.menu').hide();
			add_id=this.id;
			$('#add-song-box').animate({"height": parseInt(250)}, 'fast');
		
    	$('#'+this.id+'.menu').css({
        	top: e.pageY+'px',
        	left: e.pageX+'px'
    	}).show();

    	return false;

	});

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

function loadTracks1(name11,idd) {
	var markup = '';
	var markup1 = '';
	requestStart();
	$.ajax({
				url: '/users/show_songs',
				type: 'POST',
				data: {name: name11},
				success: function(data) {
					requestComplete();
					$('#videolist').html('');
		for(i in data.player) {
			var item = data.player[i];
			markup1 = '<div style="border: 1px solid rgb(0, 0, 0); padding: 10px; display: none; position: absolute; background-color: rgb(238, 238, 238);" class="menu" id="' + item.id + '">Add to playlist</div>';
			markup = '<a class="vid-links" href="#" id="' + item.id + '">' +
				'<div class="vid-item">' +
					'<img class="vid-thumb" src="'+ item.thumb_url + '" id="'+item.id+'" />' + 
					'<p class="vid-title" id="'+item.id+'">' + item.title+ '</p>' + 
					'<img class="play-icon play-icon-hidden" src="' + staticUrl + 'img/play.png"/>' +
				'</div>' +
			'</a>';

					$('#videolist').append(markup);
		$('#videolist').append(markup1);

		$('#'+item.id+'.menu').click(function(){

			var k = this;
			//alert(k.id);
			requestStart();
			$.get('/users/check', function(data) {
				requestComplete();
				if(data=='true')
					{	
						console.log('logged in');
						add_url = $('#'+k.id+'.vid-thumb').attr("src");
						add_title  = $('#'+k.id +'.vid-title').html();
						add_id = k.id;
						$('#add-song-box').html('');
						$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
						
						$('#add-song-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');
						getplaylist1();
						
						//alert(title);
						//alert(this.id);
						//alert($("#"+this.id+".vid-links").children('.vid-item').children('.vid-thumb')['src']);
					}
				else
				{
					$('#btn-homepage-login').click();
				}
			});


		});

		}
		$('#videolist .spinner-icon').addClass('spinner-icon-hidden');
		document.getElementById('videolist').scrollTop = 0;
		$('.vid-links').bind("contextmenu", function(e) {
			$('.menu').hide();
			add_id=this.id;
			$('#add-song-box').animate({"height": parseInt(250)}, 'fast');
		
    	$('#'+this.id+'.menu').css({
        	top: e.pageY+'px',
        	left: e.pageX+'px'
    	}).show();

    	return false;

	});

		$('.vid-links').click(function() {
			$('#videolist .play-icon').addClass('play-icon-hidden');
			$(this).children('.vid-item').children('.play-icon').removeClass('play-icon-hidden');
			nowplayingid = this.id;
			ytplayer.loadVideoById(nowplayingid);
			$('#watch-video').click();
		});

		//if(callback) callback();
		$('#'+idd+'.vid-links').click()
	}
});
}

function loadTracks111(name11,idd,user) {
	var markup = '';
	var markup1 = '';
	
	$.ajax({
				url: '/users/show_songs1',
				type: 'POST',
				data: {name: name11, user1:user},
				success: function(data) {
					$('#videolist').html('');
		for(i in data.player) {
			var item = data.player[i];
			markup1 = '<div style="border: 1px solid rgb(0, 0, 0); padding: 10px; display: none; position: absolute; background-color: rgb(238, 238, 238);" class="menu" id="' + item.id + '">Add to playlist</div>';
			markup = '<a class="vid-links" href="#" id="' + item.id + '">' +
				'<div class="vid-item">' +
					'<img class="vid-thumb" src="'+ item.thumb_url + '" id="'+item.id+'" />' + 
					'<p class="vid-title" id="'+item.id+'">' + item.title+ '</p>' + 
					'<img class="play-icon play-icon-hidden" src="' + staticUrl + 'img/play.png"/>' +
				'</div>' +
			'</a>';

					$('#videolist').append(markup);
		$('#videolist').append(markup1);

		$('#'+item.id+'.menu').click(function(){

			var k = this;
			//alert(k.id);
			$.get('/users/check', function(data) {
				if(data=='true')
					{	
						console.log('logged in');
						add_url = $('#'+k.id+'.vid-thumb').attr("src");
						add_title  = $('#'+k.id +'.vid-title').html();
						add_id = k.id;
						$('#add-song-box').html('');
						$('#overlay').css({opacity: 0}).show().animate({opacity: 0.8}, 'fast');
						
						$('#add-song-box').css({opacity: 0}).show().animate({opacity: 1}, 'fast');
						getplaylist1();
						
						//alert(title);
						//alert(this.id);
						//alert($("#"+this.id+".vid-links").children('.vid-item').children('.vid-thumb')['src']);
					}
				else
				{
					$('#btn-homepage-login').click();
				}
			});


		});

		}
		$('#videolist .spinner-icon').addClass('spinner-icon-hidden');
		document.getElementById('videolist').scrollTop = 0;
		$('.vid-links').bind("contextmenu", function(e) {
			$('.menu').hide();
			add_id=this.id;
			$('#add-song-box').animate({"height": parseInt(250)}, 'fast');
		
    	$('#'+this.id+'.menu').css({
        	top: e.pageY+'px',
        	left: e.pageX+'px'
    	}).show();

    	return false;

	});

		$('.vid-links').click(function() {
			$('#videolist .play-icon').addClass('play-icon-hidden');
			$(this).children('.vid-item').children('.play-icon').removeClass('play-icon-hidden');
			nowplayingid = this.id;
			ytplayer.loadVideoById(nowplayingid);
			$('#watch-video').click();
		});

		//if(callback) callback();
		$('#'+idd+'.vid-links').click()
	}
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
	next = $( '#' + nowplayingid ).next().next();
	if( next ) next.click();
}

function onstatechangelistener( state ) {
	if( state==0 ) playnextvideo();
}

function onYouTubePlayerReady() {
	ytplayer = document.getElementById( 'ytplayer' );
	ytplayer.addEventListener( 'onStateChange', 'onstatechangelistener' );
}