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
		if (!App.mention.active) {
			if (event.shiftKey)
				sendMessage(message, "cri");
			else
				sendMessage(message, "texte");
		} else
			App.mention.validate();

	} else if (App.mention.active) {
		if (key == 38)
			App.mention.selectPrev();
			event.preventDefault()
		if (key == 40)
			App.mention.selectNext();
			event.preventDefault()

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
		App.mention.scan();
	});

	$(document).click(function(event) { 
		if(!$(event.target).closest('.menu, .menuBouton').length){
			// le clic est en dehors d'un menu masque les menus
			updateView('hideMenus');
		}
	});

	$(document).keydown(function(event) {
		if (event.keyCode == 27)
			updateView('hideMenus');
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
	return String(string).replace(/[ "()'$]/g, "").toLowerCase();
}

function cleanSpaces(string) {
	return string.replace(/ {2,}/g, ' ');
}

function analyseMessage(texte)
{
	return texte.split(" ").map(function(mot){
		mot = activateLinks(mot);
		mot = activateMentions(mot);
		return mot;
	}).join(" ");
}

function activateLinks(mot)
{
	if (mot.substring(0, 4) == 'http')
		mot = '<a href="'+mot+'" target="_blank">'+mot+'</a>';
	return mot;
}

/**
 * Activate the @user mentions inside the words of a message
 * @param {string} mot - The word to analyse
 * @return {string}
 */
function activateMentions(mot)
{
	var index = mot.lastIndexOf('@');
	if (index == 0) {
		var user = mot.substr(1);
		if (user == App.cu.surnom) {
			//mettre ici le code de la notification
		}
		mot = '<b>' + mot + '</b>';
	}
	return mot;
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
	$('#zoneCoins').append('<div class="colonne coin" id="ajouterCoin" onclick="addLieu()">+</div>');
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

function writeListeUsers(id, liste, selectFirst = false)
{
	var html = new EJS({url: dirViews + 'listeUsers.ejs'}).render({id, liste});
	$('#listeUsers_'+ id).replaceWith(html);
	if (selectFirst) {
		$('#listeUsers_'+ id).find('li').first().addClass('active');
	}
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
			App.writeMenuCoins();
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
			App.writeMenuCoins();
			writeMenu();
			break;
		case 'hideMenus':
			$('.menu').hide();
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

function addLieu()
{
	socket.emit('addLieu');
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

function mod(n, m) {
	return ((n % m) + m) % m;
}

/**
 * Insert a string inside another.
 * @param {string} str - The base string for the insertion.
 * @param {number} ind - The index from where to insert.
 * @param {string} ins - The string to insert
 * @return {string}
 */
function insert(str, ind, ins)
{
	return str.substring(0, ind) + ins + str.substr(ind);
}

/**
 * Removes a substring  from a string.
 * @param {string} str 
 * @param {number} from 
 * @param {number} to 
 * @return {string}
 */
function removeSubstr(str, from, len)
{
	return str.substring(0, from) + str.substr(from + len);
}