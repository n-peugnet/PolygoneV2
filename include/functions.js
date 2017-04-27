var dirViews = '/views/';


function messageClavier(message, event) {
	var longueur = message.length;
	var key = event.keyCode;

    var isPrintable = 
        (key > 47 && key < 58)   || // number keys
        key == 32                || // spacebar
        (key > 64 && key < 91)   || // letter keys
        (key > 95 && key < 112)  || // numpad keys
        (key > 185 && key < 193) || // ;=,-./` (in order)
        (key > 218 && key < 224);   // [\]'! (in order)

	if (key == 8 || key == 46){
		if (longueur == 1){
			socket.emit('arretEcriture');
		}
	} else if(key == 13) {
		if (longueur > 0) {
			sendMessage(message, "texte")
		}
	} else if(isPrintable) {
		if (longueur == 0){
			socket.emit('ecriture');
		}
	}
}

$(function(){
	$('#surnom').on('input', function() {
		$(this).val(escapeSurnom($(this).val()));
		if (extSurnoms(App.allUsers()).includes($(this).val())){
			$(this).css('outline-color', 'red');
		} else {
			$(this).css('outline-color', '');
		}
	});
});

function escapeHtml(string) {
	var entityMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#39;',
	  '`': '&#x60;',
	  '=': '&#x3D;'
	};
	return String(string).replace(/[&<>"'`=]/g, function (s) {
		return entityMap[s];
	});
}

function escapeSurnom(string) {
	return String(string).replace(/[ "(]/g, "");
}

function activateLinks(texte)
{
	return texte.split(" ").map(function(mot){
		if (mot.substring(0, 4) == 'http')
			mot = '<a href="'+mot+'" target="_blank">'+mot+'</a>';
		return mot;
	}).join(" ");
}

function sendMessage(texte, type)
{
	socket.emit('message', {texte: escapeHtml(texte), type});
	$("#message").val('');	
}

function writeMessage(surnom, message, couleur, id, type, animation)
{
	var data = {surnom, message: activateLinks(message), couleur, id, type};
	var html = new EJS({url: dirViews + 'message.ejs'}).render(data);
	if (animation)
		$(html).prependTo('#dires_'+surnom).css('margin-top', '-'+$('#'+surnom+id).height()+'px').animate({ marginTop: '0px'});
	else
		$(html).prependTo('#dires_'+surnom);
}

function eraseMessage(surnom, id)
{
	var idHtml = '#'+surnom+id;
	if (id == 'ecrit'){
		$(idHtml).animate({ opacity: 0, marginTop: '-' + $(idHtml).height() +'px'}, function() { $(this).remove(); });
	} else {
		$(idHtml).animate({ opacity: 0}, 500).animate({ height: '0px'}, function() { $(this).remove(); });
	}
}

function connexion(loginForm)
{
	var prenom = $("#prenom").val();
	var surnom = escapeSurnom($("#surnom").val());
	App.cu.prenom = prenom;
	App.cu.surnom = surnom;
	socket.emit('logIn', {prenom, surnom});
}

function deconnexion()
{
	socket.emit('logOut');
}

function writeAccueil()
{
	var data = {ecoute: App.cu.ecoute, nbEcoutes: App.usersListeningTo(App.cu.ecoute).length};
	var html = new EJS({url: dirViews + 'accueil.ejs'}).render(data);
	$('section').empty().append(html);
}

function writeLogIn(etat)
{
	var data = {etat, prenom: App.cu.prenom, surnom: App.cu.surnom};
	var html = new EJS({url: dirViews + 'login.ejs'}).render(data);
	$('#nav').empty().append(html);
	if (etat < 2) {
		$('#prenom').focus();
	} else {
		$('#surnom').focus();
	}
}

function writeMenu()
{
	var data = {surnom: App.cu.surnom, presence: App.cu.presence};
	var html = new EJS({url: dirViews + 'menu.ejs'}).render(data);
	$('#menu').replaceWith(html);
}

function writeMemoire()
{
	var html = new EJS({url: dirViews + 'memoire.ejs'}).render();
	$('#nav').append(html);
}

function writeMemory(pers_cite, citation)
{
	var data = {pers_cite, citation: activateLinks(citation)};
	var html = new EJS({url: dirViews + 'memory.ejs'}).render(data);
	$('#memoire').prepend(html);
}

function writeCoin(num, taille)
{
	var data = {num, taille, presence: App.cu.presence, loggedIn: App.cu.loggedIn};
	var html = new EJS({url: dirViews + 'coin.ejs'}).render(data);
	$('#coins').append(html);
}

function writeMenuCoins()
{
	$('#zoneCoins').append('<div class="colonne coin" id="ajouterCoin" onclick="addCoin()">+</div>');
}

function eraseMenuCoins()
{
	$('#ajouterCoin').remove();
}

function eraseCoin(num)
{
	$('#coin'+num).remove();
}

function writeEcoutes()
{
	var liste = App.usersListeningTo(App.cu.ecoute);
	$('#nbEcoutes').empty().append(liste.length);
}

function updateView(action)
{
	switch(action)
	{
		case 'init':
			break;
		case 'alreadyUsed':
			writeLogIn(1);
			break;
		case 'wrongPrenom':
			writeLogIn(2);
			break;
		case 'loggedIn':
			writeMenu();
			$('.boutonMove').prop('disabled', false);
			writeMenuCoins();
			break;
		case 'loggedOut':
			writeLogIn(0);
			eraseMenuCoins();
			break;
		case 'listenTo':
			writeAccueil();
			App.writeCoins();
			App.writeUsers();
			writeMenuCoins();
			writeMenu();
			break;
	}
}

function goTo(lieu)
{
	socket.emit('move', lieu);
}

function listenTo(lieu)
{
	socket.emit('listen', lieu);
}

function addCoin()
{
	socket.emit('addCoin');
}

function addMemory(surnom, message)
{
	socket.emit('addMemory', {surnom, message});
	writeMemory(surnom, message);
}

function citation(pers_cite, citation)
{
	sendMessage( pers_cite + " : " + citation, "citation");
}

function crier()
{
	sendMessage( $("#message").val(), "cri");
}

function extSurnoms(listeUsers)
{
	return listeUsers.map(function(u) {return u.surnom; });
}