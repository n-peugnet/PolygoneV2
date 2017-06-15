$(setEvents);

/**
 * Key mapping for the message input field.
 * @param {string} message - text inside the input field.
 * @param {KeyboardEvent} event - the keybord event.
 */
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
		if (event.shiftKey)
			sendMessage(message, "cri");
		else
			sendMessage(message, "texte");
	} else if(isPrintable) {
		if (longueur == 0) {
			socket.emit('ecriture');
		}
	}
}

function setEvents(){
	$('#surnom').on('input', function() {
		$(this).val(escapeSurnom($(this).val()));
		if (App.isUserLoggedIn($(this).val())){
			$(this).css('outline-color', 'red');
		} else {
			$(this).css('outline-color', '');
		}
	});

	$('#message').on('input', function() {
		var substring = $(this).val().split(' ').pop()
		var index = substring.indexOf('@');
		if (index >= 0) {
			var lettres = substring.substr(index + 1);
			var liste = App.usersStartingWith(lettres);
			if (liste.length > 0)
				writeListeUsers('mentionner', liste);
			else
				hideListe('mentionner');
		} else {
			hideListe('mentionner');
		}
	});

	$(document).click(function(event) { 
		if(!$(event.target).closest('.menu, .menuBouton').length){
			// le clic est en dehors d'un menu masque les menus
			$('.menu').hide();
		}
	});
}

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
	return string.replace(/[&<>"'`=]/g, function (s) {
		return entityMap[s];
	});
}

function escapeSurnom(string) {
	return String(string).replace(/[ "()'$]/g, "");
}

function cleanSpaces(string) {
	return string.replace(/ {2,}/g, ' ');
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
	if (texte.length > 0) {
		texte = cleanSpaces(escapeHtml(texte));
		socket.emit('message', {texte, type});
	}
	$("#message").val('').focus();
}

function toggle(objectId, buttonId)
{ 
	var obj = $("#"+objectId);
	var btn = $("#"+buttonId);
	if(obj.css("display") == 'block') {
		obj.hide();
		btn.text("Afficher");
	} else {
		obj.show();
		btn.text("Masquer");
	}
}

function toggleMenu(menuId)
{
	$("#"+ menuId).show();
}

function connexion(loginForm)
{
	var prenom = $("#prenom").val();
	var surnom = escapeSurnom($("#surnom").val());
	App.storeId(prenom, surnom);
	socket.emit('logIn', {prenom, surnom});
}

function deconnexion()
{
	socket.emit('logOut');
}

function writeAccueil()
{
	var data = {ecoute: App.cu.ecoute};
	var html = new EJS({url: dirViews + 'accueil.ejs'}).render(data);
	$('section').empty().append(html);
	writeEcoutes();
	App.writeAnonymes();
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
	setEvents();
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
	console.log(liste);
	$('#nbEcoutes').empty().append(liste.length);
}

function writeListeUsers(id, liste)
{
	var html = new EJS({url: dirViews + 'listeUsers.ejs'}).render({id, liste});
	$('#listeUsers_'+ id).replaceWith(html);
}

function hideListe(id)
{
	$('#listeUsers_'+ id).hide();
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
			App.writeUsersMenu();
			writeMenuCoins();
			setEvents();
			break;
		case 'loggedOut':
			updateView('listenTo');
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

function addMemory(surnom, id)
{
	var message = App.getUser(surnom).getMessage(id).texte;
	socket.emit('addMemory', {surnom, message});
	App.addMemory(surnom, message);
}

function citation(id)
{
	App.getMemory(id).send();
}

function crier()
{
	sendMessage( $("#message").val(), "cri");
}

function extSurnoms(listeUsers)
{
	return listeUsers.map(function(u) {return u.surnom; });
}

function idGen(array){
	if (array.length == 0)
		return 0;
	else
		return array[array.length - 1].id + 1;
}