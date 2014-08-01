var port=process.env.PORT || 3000;
var express=require('express'),   
   app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server),
   routes=require('./routes'),
   user=require('./routes/user'),   
   nickNames=[];



var counter=0;

app.set('views',__dirname + '/views');
app.set('view engine','jade');
app.get('/',routes.index);
app.get('/chat',user.chat);




  io.sockets.on('connection', function (socket) {


  	counter++;
  	console.log('Usuario Conectado')
    io.sockets.emit('cliente', { 

    	  number:counter,
        lista:nickNames

    })
 
    socket.on('disconnect',function(req,res){
        counter--;
 	    console.log('Usuario Desconectado , en este momento hay online :%d',counter)
    	socket.broadcast.emit('cliente',{number:counter})

    	if(!socket.nickName) return;

    	if(nickNames.indexOf(socket.nickName)>-1){

             nickNames.splice(nickNames.indexOf(socket.nickName),1);
             console.log(nickNames)

    	}

    })


    socket.on('mensaje',function(data){   

    	io.sockets.emit('nuevoMensaje',{
    		nuevoMensaje:data.texto,
    		nick:socket.nickName
    	});
    
    

    })

    socket.on('nickName',function(data,callback){       
       
       if (nickNames.indexOf(data)!=-1){
         
       	 callback(false)

       } else{      
    	   nickNames.push(data);
    	   socket.nickName=data;  
      	 callback(true)

        }

    })

});



server.listen(port,function(res,res){

    savedResponse=res;
	console.log('Server Corriendo en puerto ' + port);
});