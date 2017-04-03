var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var mysql   = require('mysql');
var path    = require('path');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'polygone'
});


var dirViews = '/views/';
var lieux = [0,0,0,0];


app.use(express.static(__dirname));
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + dirViews + 'index.html'));
});
app.use(function(req, res, next){
    res.redirect('/');
});


io.on('connection', function(client){
	client.loggedIn = false;
	client.prenom;
	client.surnom;
	client.presence = 0;
	client.ecoute = 0;
	
	var infosClients = infosAllClients();
	client.emit('init',{nbLieux: lieux.length, infosClients});
	
	client.on('logIn', function(data){
		lieux[0] ++;	
		client.loggedIn = true;
		client.surnom = data.surnom;
		client.couleur = pickColor();
		
		client.broadcast.emit('newLogIn', {surnom: data.surnom, couleur: client.couleur});
		client.emit('loggedIn', client.couleur);
	});
	client.on('logOut', function(){
		client.broadcast.emit('logOut', {surnom: client.surnom, lieu: client.presence});	
		lieux[client.presence] --;
		if(client.ecoute != client.presence){
			lieux[client.ecoute] --;
		}
		client.loggedIn = false;
		client.surnom = '';
		client.emit('loggedOut');
		
		datedLog('nouvelle connexion au serveur');
	});
	client.on('ecriture', function(){
		client.broadcast.emit('ecriture', {surnom: client.surnom, lieu: client.presence});
	});
	client.on('arretEcriture', function(){
		client.broadcast.emit('arretEcriture', {surnom: client.surnom, lieu: client.presence});
	});	
	client.on('message', function(texte){
		client.broadcast.emit('message',{surnom: client.surnom, lieu: client.presence, message: texte });
		client.emit('message',{surnom: client.surnom, lieu: client.presence, message: texte });
	});
	client.on('move', function(destination){
		client.broadcast.emit('move', {surnom: client.surnom, presence: client.presence, destination });
		client.emit('goTo', destination);
		move(client.presence, destination);
		client.presence = destination;
	});
	client.on('listen', function(ecoute){
		client.broadcast.emit('listen', {surnom: client.surnom, presence: client.presence, ecoute });
		client.emit('listenTo', ecoute);
		if (client.presence != ecoute){
			lieux[ecoute] ++;
		} else {
			lieux[client.ecoute] --;
		}
		client.ecoute = ecoute;
	});
	client.on('addCoin', function(){
		lieux.push(0);
		client.broadcast.emit('addCoin');
		client.emit('addCoin');
		setTimeout(function removeLieu(){
			var i = lieux.length - 1;
			if (lieux[i] <= 0){
				lieux.pop();
				client.broadcast.emit('rmvCoin');
				client.emit('rmvCoin');
			} else {
				setTimeout(removeLieu, 60000);
			}
		},60000);
	});
	client.on('disconnect', function(){
		if (client.loggedIn)
		{	
			lieux[client.presence] --;
			if(client.ecoute != client.presence){
				lieux[client.ecoute] --;
			}
			client.broadcast.emit('logOut', {surnom: client.surnom, lieu: client.presence});
		}
	});
});

server.listen(3000);

/*connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
  console.log('The solution is: ', rows[0].solution);
});

connection.end();*/

function allClients()
{
	var clientsList = [];
	for(id in io.sockets.sockets)
	{
		client = io.sockets.connected[id];
		if (client.loggedIn)
		{
			clientsList.push(client);
		}
	}
	return clientsList;
}

function infosAllClients(surnom)
{
	var infoClients = [];
	allClients(surnom).forEach(function(client){
		infoClients.push({surnom: client.surnom, presence: client.presence, couleur: client.couleur });
	});
	return infoClients;
}

function otherClients(surnom)
{
	var clientsList = [];
	for(id in io.sockets.sockets)
	{
		client = io.sockets.connected[id];
		if (client.surnom != surnom)
		{
			clientsList.push(client);
		}
	}
	return clientsList;
}

function surnomOtherClients(surnom)
{
	var surnomClients = [];
	otherClients(surnom).forEach(function(client){
		surnomClients.push(client.surnom);
	});
	return surnomClients;
}

function infosOtherClients(surnom)
{
	var infoClients = [];
	otherClients(surnom).forEach(function(client){
		infoClients.push({surnom: client.surnom, presence: client.presence });
	});
	return infoClients;
}

function pickColor()
{
	var couleur;
	switch (Math.floor((Math.random() * 7)))
	{
		case 0: couleur = "#6289ff";
		break;
		case 1: couleur = "#36d64a";
		break;
		case 2: couleur = "#f59c16";
		break;
		case 3: couleur = "#c95093";
		break;
		case 4: couleur = "#06b4bd";
		break;
		case 5: couleur = "#ec2424";
		break;
		case 6: couleur = "#e1d000";
	}
	return couleur;
}

function move(pres, dest)
{
	lieux[pres] --;
	lieux[dest] ++;
}

function datedLog(o)
{
    console.log('[' + new Date().toUTCString() + '] :', o);
}