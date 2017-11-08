var express  = require('express');
var app      = express();
var server   = require('http').createServer(app);
var path     = require('path');
var io       = require('socket.io')(server);
var mysql    = require('mysql');
var schedule = require('node-schedule');
var exsess   = require('express-session');
var iosess   = require("express-socket.io-session");
var config   = require('./config');
var params   = config.app;

var connection = mysql.createConnection(config.mysql);
var session = exsess({
	secret: config.session.secret,
	resave: false,
	saveUninitialized: true
});

var lieux = Array(params.nbLieuxMin).fill(0);;

// Use express-session middleware for express
app.use(session);
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/public/views'));
app.get('/', function(req, res){
	var sess = req.session;
	if(!sess.prenom && !sess.surnom) {
		sess.prenom = '';
		sess.surnom = '';
	}
	res.render('index.ejs', {
		ip                : config.client.ip,
		port              : config.client.port,
		nomApp            : params.nomApp,
		premierLieuPublic : params.premierLieuPublic,
		nomLieu           : params.nomLieu,
		nomLieux          : params.nomLieux,
		nomLieu0     : params.nomLieu0,
		prenom            : sess.prenom,
		surnom            : sess.surnom
	});
});
app.use(function(req, res, next){
    res.redirect('/');
});


// Use shared session middleware for socket.io
// setting autoSave:true
io.use(iosess(session, {
	autoSave:true
})); 
io.on('connection', function(client){
//------------ properties ---------------
	client.loggedIn = false;
	client.prenom;
	client.surnom;
	client.presence = 0;
	client.ecoute = 0;
	
//------------- functions ---------------
	client.logIn = function(prenom, surnom, couleur, action)
	{
		lieux[0] ++;
		this.loggedIn = true;
		this.prenom   = prenom;
		this.surnom   = surnom;
		this.couleur  = couleur;
		
		switch(action) {
			case "ajouter":
				var session = {prenom, surnom, couleur};
				var query = connection.query('INSERT INTO sessions SET ?', session, function (error, results, fields) {
					if (error) throw error;
				});
				break;
			case "update":
				var query = connection.query('UPDATE sessions SET date_activite = NOW() WHERE surnom = ?', surnom, function (error, results, fields) {
					if (error) throw error;
				});
				break;
		}
		this.broadcast.emit('newLogIn', {surnom, couleur});
		this.emit('loggedIn', couleur);
		var self = this;
		this.getMemory(function(memory){
			self.emit('setMemory', memory);
		});
		
		//write login informations in the session
		client.handshake.session.prenom = prenom;
		client.handshake.session.surnom = surnom;
		client.handshake.session.save();
		
		datedLog('log in - ' + surnom);
	}

	client.otherClients = function()
	{
		var clientsList = [];
		for(id in io.sockets.sockets)
		{
			c = io.sockets.connected[id];
			if (c.surnom != this.surnom)
			{
				clientsList.push(c);
			}
		}
		return clientsList;
	}
	
	client.getMemory = function(callback)
	{
		var query = connection.query('SELECT pers_cite, citation FROM memoire WHERE surnom = ?', this.surnom, function (error, result, fields) {
			if (error) throw error;
			callback(result);
		});
	}
	
//---------- initialisation -------------
	var infosClients = extInfos(client.otherClients());
	client.emit('init', {
		nbLieux: lieux.length,
		infosClients,
		params,
		nbAnonymes: getNbAnonymes()
	});
	client.broadcast.emit('connection');
	datedLog('new connection');
	
//-------------- events -----------------
	client.on('logIn', function(data){
		if (extSurnoms(loggedInClients()).includes(data.surnom)){
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
		client.broadcast.emit('logOut', {surnom: client.surnom, lieu: client.presence});
		client.emit('loggedOut');
		
		client.loggedIn = false;
		client.surnom = null;
		if (client.presence != 0)
		{
			if(client.ecoute != client.presence){
				lieux[client.ecoute] --;
			}
			move(client.presence, 0);
			client.presence = 0;
		}
		
		//erase login informations from the session
		client.handshake.session.prenom = '';
		client.handshake.session.surnom = '';
		client.handshake.session.save();
		
		setTimeout(function(){
			if (!client.loggedIn)
				lieux[client.presence] --;
		}, 17000);
		
		datedLog('log out - ' + client.surnom);
	});
	client.on('ecriture', function(){
		client.broadcast.emit('ecriture', {surnom: client.surnom, lieu: client.presence});
	});
	client.on('arretEcriture', function(){
		client.broadcast.emit('arretEcriture', {surnom: client.surnom, lieu: client.presence});
	});	
	client.on('message', function(data){
		data.surnom = client.surnom;
		data.lieu = client.presence;
		client.broadcast.emit('message', data);
		client.emit('message', data);
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
	client.on('addLieu', function(){
		if (lieux.length < params.nbLieuxMax || params.nbLieuxMax == 0) {
			lieux.push(0);
			client.broadcast.emit('addLieu');
			client.emit('addLieu');
			setTimeout(function removeLieu(){
				var i = lieux.length - 1;
				if (lieux[i] <= 0){
					lieux.pop();
					client.broadcast.emit('rmvLieu');
					client.emit('rmvLieu');
				} else {
					setTimeout(removeLieu, 60000);
				}
			},60000);
		}
	});
	client.on('addMemory', function(data){
		var memory = {surnom: client.surnom, pers_cite: data.surnom, citation: data.message};
		var query = connection.query('INSERT INTO memoire SET ?', memory, function (error, results, fields) {
			if (error) throw error;
		});
	});
	client.on('askSymKey', function(data){
		var liste = loggedInClients();
		var c = getClient(liste, data.surnom);
		if (c != undefined) {
			data = {
				surnom : client.surnom,
				n      : data.n,
				e      : data.e
			};
			c.emit('askSymKey', data);
		}
	});
	client.on('sendSymKey', function(data){
		var liste = loggedInClients();
		var c = getClient(liste, data.surnom);
		if (c != undefined) {
			data = {
				surnom : client.surnom,
				cSymKey : data.cSymKey
			};
			c.emit('sendSymKey', data);
		}
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
		client.broadcast.emit('disconnection');
		
		datedLog('disconnection - ' + client.surnom);
	});
});

server.listen(config.web.port, datedLog("Listening on port " + config.web.port + ", clients connects to " + config.client.ip + ":" + config.client.port));

var j = schedule.scheduleJob('0 2 * * *', function(){
	var query = connection.query('DELETE FROM sessions WHERE DATE_ADD(date_activite, INTERVAL 20 DAY) <= NOW()', function (error, results, fields) {
		if (error) throw error;
		console.log('deleted ' + results.affectedRows + ' rows');
	});
});

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

function getNbAnonymes()
{
	var nb = 0;
	for(id in io.sockets.sockets)
	{
		client = io.sockets.connected[id];
		if (client.surnom == null)
			nb++;
	}
	return nb;
}

function extSurnoms(listeClients)
{
	return listeClients.map(function(c) {return c.surnom; });
}

/**
 * finds a client by his nickname from a list of clients
 * @param {array} listeClients - list of clients
 * @param {string} surnom - nickname
 */
function getClient(listeClients, surnom)
{
	return listeClients.find(function(c) { return c.surnom == surnom; });
}

function extInfos(listeClients)
{
	return listeClients.map(function(c) {return {surnom: c.surnom, presence: c.presence, ecoute: c.ecoute, couleur: c.couleur}; });
}

function pickColor()
{
	var couleur;
	switch (Math.floor( Math.random() * 7 ))
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