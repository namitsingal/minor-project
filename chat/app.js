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
io=require('socket.io').listen(app),
fs=require('fs');
app.listen(8080);

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
io.socket.on('connection',function(socket) {
	  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
