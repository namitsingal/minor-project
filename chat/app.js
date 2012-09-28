fs=require('fs');
var app=require('http').createServer(function handler(req,res) {
        fs.readFile(__dirname + '/index.html',function(err,data) {
                if(err)
                {       res.writeHead(500);
                        return res.end('Error loading index.html');
                }

res.writeHead(200);
res.end(data);
});
}
),
ios=require('socket.io');
io=ios.listen(app);
//fs=require('fs');
app.listen(8080);
var usernames = {};

/*function handler(req,res) {
	fs.readFile(__dirname + '/index.html',function(err,data) {
		if(err)
		{	res.writeHead(500);
			return res.end('Error loading index.html');
		}

res.writeHead(200);
res.end(data);
});
}
*/
io.sockets.on('connection', function (socket) {

        // client  'sendchat' brings it here
        socket.on('sendchat', function (data) {
                //client execute 'updatechat'
                io.sockets.emit('updatechat', socket.username, data);
        });

    socket.on('adduser', function(username){
                //  store the username in the socket session
                socket.username = username;
                // add the client's username to the global list
                usernames[username] = username;
               
                socket.emit('updatechat', 'SERVER', 'you have connected');
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
                // update the list of users in chat, all clients(IO)
               io.sockets.emit('updateusers', usernames);
	socket.on('disconnect', function(){
                // remove the username from global usernames list
                delete usernames[socket.username];
                // update list of users in chat, client-side
                io.sockets.emit('updateusers', usernames);
                // echo globally that this client has left
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        });

        });
});
