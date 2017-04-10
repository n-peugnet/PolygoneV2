var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var mysql   = require('mysql');
var config  = require('./config');

var connection = mysql.createConnection(config.mysql);

var lieux = [0,0,0,0];

app.use(express.static(__dirname));
app.get('/', function(req, res){
	res.render('index.ejs', {});
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
	
	client.logIn = function(prenom, surnom, couleur, action)
	{
		lieux[0] ++;	
		this.loggedIn = true;
		this.prenom = prenom;
		this.surnom = surnom;
		this.couleur = couleur;
		
		if (action == "ajouter"){
			var session  = {prenom, surnom, couleur};
			var query = connection.query('INSERT INTO sessions SET ?', session, function (error, results, fields) {
				if (error) throw error;
				// Neat! 
			});
		}
		
		this.broadcast.emit('newLogIn', {surnom: surnom, couleur: couleur});
		this.emit('loggedIn', couleur);
	}
	
	var infosClients = infosOtherClients(client.surnom);
	client.emit('init', {nbLieux: lieux.length, infosClients});
	
	client.on('logIn', function(data){
		if (loggedInClients().map(function(c) {return c.surnom; }).includes(data.surnom)){
			client.emit('alreadyUsed');
		} else {
			var query = connection.query('SELECT couleur, prenom FROM sessions WHERE surnom = ?', data.surnom, function (error, result, fields) {
				if (error) throw error;
				if (result.length == 1) {
					if (result[0].prenom != data.prenom) {
						client.emit('wrongPrenom');
					} else {
						client.logIn(data.prenom, data.surnom, result[0].couleur, "update");
					}
				} else {
					client.logIn(data.prenom, data.surnom, pickColor(), "ajouter");
				}
			});
		}
	});
	client.on('logOut', function(){
		client.loggedIn = false;
		client.broadcast.emit('logOut', {surnom: client.surnom, lieu: client.presence});
		client.emit('loggedOut');
		setTimeout(function(){
			lieux[client.presence] --;
			if(client.ecoute != client.presence){
				lieux[client.ecoute] --;
			}
			client.surnom = '';
		}, 17000);
		
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

server.listen(config.web.port);

function loggedInClients()
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
	return otherClients(surnom).map(function(c) {return c.surnom; });
}

function infosOtherClients(surnom)
{
	return otherClients(surnom).map(function(c) {return {surnom: c.surnom, presence: c.presence, couleur: c.couleur}; });
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