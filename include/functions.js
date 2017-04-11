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
			socket.emit('message', escapeHtml(message));
			$("#message").val('');
		}
	} else if(isPrintable) {
		if (longueur == 0){
			socket.emit('ecriture');
		}
	}
}

$(function(){
	$('#surnom').keypress(function(e){
		var key = e.keyCode;
		var forbidden = [32, 34]
        if (forbidden.includes(key))
			e.preventDefault();
	}).on('input', function() {
		if (extSurnoms(Lieux.allUsers()).includes($(this).val())){
			$(this).css('outline-color', 'red');
		} else {
			$(this).css('outline-color', '');
		}
	}).on('paste', function(e) {
		var pasteData = e.originalEvent.clipboardData.getData('text');
		console.log(pasteData);
	});
});

function escapeHtml (string) {
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

function activateLinks(texte)
{
	return texte.split(" ").map(function(mot){
		if (mot.substring(0, 4) == 'http')
			mot = '<a href="'+mot+'" target="_blank">'+mot+'</a>';
		return mot;
	}).join(" ");
}

function writeMessage(surnom, message, couleur, id)
{
	var data = {message: activateLinks(message), couleur:couleur, id: surnom+id};
	var html = new EJS({url: dirViews + 'message.ejs'}).render(data);
	$('#dires_'+surnom).append(html);
}

function eraseMessage(surnom, id)
{
	$('#'+surnom+id).remove();
}

function connexion(loginForm)
{
	CrntUser.prenom = $("#prenom").val();
	CrntUser.surnom = $("#surnom").val();
	socket.emit('logIn', {prenom: CrntUser.prenom, surnom: CrntUser.surnom});
}

function deconnexion()
{
	socket.emit('logOut');
}

function writeAccueil()
{
	var data = {ecoute: CrntUser.ecoute};
	var html = new EJS({url: dirViews + 'accueil.ejs'}).render(data);
	$('section').empty().append(html);
}

function writeLogIn(etat)
{
	var data = {etat, prenom: CrntUser.prenom, surnom: CrntUser.surnom};
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
	var data = {surnom: CrntUser.surnom, presence: CrntUser.presence};
	var html = new EJS({url: dirViews + 'menu.ejs'}).render(data);
	$('#nav').empty().append(html);
}

function writeCoin(num, taille)
{
	var data = {num, taille, presence: CrntUser.presence, loggedIn: CrntUser.loggedIn};
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
			Lieux.writeCoins();
			Lieux.writeUsers();
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

function extSurnoms(listeUsers)
{
	return listeUsers.map(function(u) {return u.surnom; });
}