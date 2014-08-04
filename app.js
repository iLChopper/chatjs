var port=3000; //Puerto del chat
//Modulos requeridos
var express=require('express'),
   path = require('path'),   
   app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server),
   routes=require('./routes');

   nickNames=[]; //Lista para guardar la lista de nicks



var counter=0; //Numeros de usuarios en un momento dado en el chat.

app.set('views',__dirname + '/views'); //ruta donde se encuentras las vistas
app.set('view engine','jade'); //Utilizo jade como motor de vista
app.get('/',routes.index); // Muestro el index.jade

//Ruta de archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));



  //Cuando se conecta un user nuevo automaticamente se ejecuta este evento
  io.sockets.on('connection', function (socket) {


  	counter++; //Sumo un al counter de usuarios
  	console.log('Usuario Conectado')

    //Emito el evento cliente,avisando a todos los usuarios que  se conecto un nuevo user 
    io.sockets.emit('cliente', {number:counter})

    //Evento que se ejecuta al desconectarse un user
    socket.on('disconnect',function(req,res){
        counter--; //Lo saco del counter de usuarios
 	    console.log('Usuario Desconectado , en este momento hay online :%d',counter)
    	

    	if(!socket.nickName) return; //Verifico que exista el nickname

    	if(nickNames.indexOf(socket.nickName)>-1){ //Si el nickname esta dentro de la lista de nicks lo elimino.

             nickNames.splice(nickNames.indexOf(socket.nickName),1);
             console.log(nickNames)

    	}
      //Aviso a todos los usuarios la nueva cantidad de usuarios y actualizo la lista de nicks 
      socket.broadcast.emit('cliente',{number:counter,listaNicks:nickNames})

    })
   

    //Evento a la espera de que un usuario entre al chat e ingrese su nickname
    socket.on('nickName',function(data,callback){       
       
       //Verifico que el nickname no este en uso
       if (nickNames.indexOf(data)!=-1){         
       	 callback(false)

       } else{   
          //Si el nick es valido, lo ingreso a la lista de nicks          
    	   nickNames.push(data);
         //Cada user tiene un socket que lo relaciona con el server , 
         //entonces identifico el socket con el nickname  del usuario
    	   socket.nickName=data;     
         //Actualizo la lista de nicknames de todos los usuarios
         io.sockets.emit('listaNicks',{  
            listaNicks:nickNames
         });           
      	 callback(true)
        }

    })  

     //Evento  a la espera de que un cliente escriba en el chat un mensaje
    socket.on('mensaje',function(data){   

      //Envio a todos los clientes, el mensaje escrito en el chat , junto con el nick de quien lo escribio  
      io.sockets.emit('nuevoMensaje',{
        nuevoMensaje:data.texto,
        nick:socket.nickName //Observarse que el nick se obtiene desde el socket
      });  
    

    }) 

});
server.listen(port,function(res,res){   
	console.log('Server Corriendo en puerto ' + port);
});