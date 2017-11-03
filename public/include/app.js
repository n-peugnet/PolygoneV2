/** @namespace */
var App = {
	lieux : [new Lieu(0, [], 0)],  // List of the different places.
	nbAnonymes: 0,
	params : {},
	sons : {
		user     : new Audio('/sounds/user.wav'),
		message  : new Audio('/sounds/message.flac'),
		cri      : new Audio('/sounds/cri.wav'),
		appel    : new Audio('/sounds/appel.wav')
	},
	cu : {                // current user informations
		memoire: [],
		loggedIn: false,
		prenom: "",
		surnom: "",
		couleur: "",
		crypto: new Encryption("none"),
		privKey: new RSAKey(),
		presence: 0,
		ecoute: 0
	},
	mention : new Mention(),

	init(params)
	{
		this.params = params;
		this.lieux[0].nom = params.nomLieu0;
		Lieu.setNomLieu(params.nomLieu);
	},
	
	lieuxPrives()
	{
		return this.lieux.slice(1);
	},
	
	allUsers()
	{
		var listeUsers = [];
		this.lieux.forEach(function(lieu) {
			listeUsers = listeUsers.concat(lieu.users);
		});
		return listeUsers;
	},
	
	usersListeningTo(lieu)
	{
		var listeUsers = [];
		this.lieux.forEach(function(l, numLieu) {
			if (numLieu != lieu){
				l.users.forEach(function(u){
					if (u.ecoute == lieu)
						listeUsers.push(u);
				});
			}
		});
		return listeUsers;
	},

	/**
	 * Get an arry of users which nick name starts with the letters given.
	 * @param {string} lettres - first letters of the users's nicknames.
	 * @param {number} lieu - (optional)
	 * @return {User[]}
	 */
	usersStartingWith(lettres, lieu = this.cu.presence)
	{
		return this.lieux[lieu].usersStartingWith(lettres);
	},
	
	addLieu()
	{
		var newLieu = new Lieu(this.lieux.length);
		this.lieux.push(newLieu);
		newLieu.write(this.cu);
		if (this.lieux.length == this.params.nbLieuxMax) eraseMenuCoins();
	},
	
	delLastLieu()
	{
		this.delLieu(this.lieux.length - 1);
		if (this.lieux.length == this.params.nbLieuxMax -1) writeMenuLieux();
	},
	
	delLieu(lieu)
	{
		this.lieux.splice(lieu, 1);
		eraseCoin(lieu);
	},

	addCitation(surnom, id)
	{
		var user     = this.getUser(surnom)
		var cmessage = user.getMessage(id).texte;
		var message  = user.crypto.decrypt(cmessage);
		socket.emit('addMemory', {surnom, message});
		App.addMemory(surnom, message);
	},

	addMemory(persCite, citation)
	{
		var newCitation = new Citation(idGen(this.cu.memoire), persCite, citation).write();
		this.cu.memoire.push(newCitation);
	},
	
	sendCitation(id)
	{
		this.getMemory(id).send(this.cu.crypto);
	},
	
	getMemory(id)
	{
		return this.cu.memoire.find(function(m){ return m.id == id; });
	},
	
	storeId(prenom, surnom)
	{
		this.cu.prenom = prenom;
		this.cu.surnom = surnom;
	},
	
	reconnect()
	{
		var prenom = this.cu.prenom;
		var surnom = this.cu.surnom;
		if (prenom != '' && surnom != '')
			socket.emit('logIn', {prenom, surnom});
	},
	
	logInCUser(couleur)
	{
		this.cu.loggedIn = true;
		this.cu.couleur = couleur;
		this.addUser(this.cu.surnom, couleur);
	},
	
	logOutCUser()
	{
		this.cu.loggedIn = false;
		this.goTo(0);
		this.delUser(this.cu.surnom, this.cu.presence);
	},

	presenceCUser()
	{
		return this.lieux[this.cu.presence];
	},
	
	goTo(dest)
	{
		this.moveUser(this.cu.surnom, this.cu.presence, dest);
		this.cu.presence = dest;
		this.cu.ecoute = dest;		
	},
	
	listenTo(lieu)
	{
		this.focusUser(this.cu.surnom, this.cu.presence, lieu);
		this.cu.ecoute = lieu;
	},
	
	sendMessage(texte, type)
	{
		if (texte.length > 0) {
			texte = cleanSpaces(escapeHtml(texte));
			texte = this.cu.crypto.encrypt(texte);
			socket.emit('message', {texte, type});
		}
		$("#message").val('').focus();
	},
	
	updateCryptoType(type)
	{
		this.cu.crypto.type = type;
		this.getUserIn(this.cu.surnom, this.cu.presence).crypto.type = type;
	},

	updateCryptoKeyCU(key)
	{
		this.cu.crypto.key = key;
		this.getUserIn(this.cu.surnom, this.cu.presence).crypto.key = key;
	},
	
	updateCryptoKey(key, surnom)
	{
		var pres =  this.cu.presence;
		var user = this.getUserIn(surnom, pres);
		user.crypto.key = key;
		user.writeMessages();

	},
	
	rsaGen() {
		var before = new Date();
		console.log("Generating rsa key");
		this.cu.privKey.generate(2048, '10001');
		var after = new Date();
		console.log("Key Generation Time: " +(after - before) + "ms");
		return this.cu.privKey;
	},
	
	initAnonymes(nb)
	{
		this.nbAnonymes = nb;
		this.writeAnonymes();
	},
	
	addAnonyme()
	{
		this.nbAnonymes ++;
		this.writeAnonymes();
	},
	
	rmvAnonyme()
	{
		this.nbAnonymes --;
		this.writeAnonymes();
	},

	addUser(surnom, couleur)
	{
		this.addUserIn(surnom, 0, 0, couleur);
		this.rmvAnonyme();
		if (surnom != this.cu.surnom && this.cu.presence == 0)
			this.sons.user.play();
	},
	
	addUserIn(surnom, pres, ecoute, couleur)
	{
		var current = surnom == this.cu.surnom && this.cu.loggedIn; //determine si l'utilisateur est bien l'utilisateur courant
		this.lieux[pres].addUser(surnom, ecoute, couleur, current);
	},
	
	addMessageTo(surnom, lieu, texte, type)
	{
		if (surnom != this.cu.surnom && lieu == this.cu.ecoute)
		{
			switch(type){
				case "cri":
					this.sons.cri.play();
					break;
				case "texte":
				default:
					this.sons.message.play();
			}
		}
		this.getUserIn(surnom, lieu).addMessage(texte, type);
	},
	
	isUserLoggedIn(surnom)
	{
		var user = this.getUser(surnom);
		if (user !== undefined)
		{
			if (user.actif)
				return true;
		}
		return false;
	},
	
	/**
	 * finds a user based on its presence and its nickname
	 * @param {string} surnom - the user's nickname
	 * @param {number} lieu - the place's number
	 * @return {User}
	 */
	getUserIn(surnom, lieu)
	{
		return this.lieux[lieu].getUser(surnom);
	},
	
	
	/**
	 * finds a user based on its nickname
	 * @param {string} surnom - the user's nickname
	 * @return {User}
	 */
	getUser(surnom)
	{
		return this.allUsers().find(function(u) {return u.surnom == surnom; });
	},
	
	delUser(surnom, lieu)
	{
		var self = this;
		var user = this.lieux[lieu].getUser(surnom);
		user.disableIn(lieu);
		if (lieu != 0) this.moveUser(surnom, lieu, 0);
		this.addAnonyme();
		setTimeout(function(){
			console.log(user);
			user = self.lieux[0].getUser(surnom);
			console.log(user);
			if(!user.actif){
				user.eraseIn(0);
				self.lieux[0].removeUser(surnom);
			}
		}, 17000);
	},

	/**
	 * Move a user from one place to another.
	 * @param {string} surnom - The user's nickname.
	 * @param {number} lDepart - The departure number.
	 * @param {number} lArrivee - The destination number.
	 * @return {number} The user's new index in destination.
	 */
	moveUser(surnom, lDepart, lArrivee)
	{
		this.focusUser(surnom, lDepart, lArrivee);
		if ( lDepart != lArrivee)
		{
			var user = this.lieux[lDepart].removeUser(surnom);
			index = this.lieux[lArrivee].moveUserIn(user);
			if (!user.current)
			{
				user.eraseIn(lDepart);
				user.writeIn(lArrivee);
				if (lArrivee == this.cu.presence && user.actif)
					this.sons.user.play();
			}
		}
		return index;
	},
	
	focusUser(surnom, pres, ecoute)
	{
		var ecoutePre = this.getUserIn(surnom, pres).listenTo(ecoute);
		if (ecoute == this.cu.ecoute || ecoutePre == this.cu.ecoute) {
			writeEcoutes();
		}
	},
	
	writeAccueil()
	{
		var data = {
			ecoute            : this.cu.ecoute,
			premierLieuPublic : this.params.premierLieuPublic,
			nomApp            : this.params.nomApp,
			nomLieu           : this.params.nomLieu,
			nomLieux          : this.params.nomLieux,
			nomLieu0     : this.params.nomLieu0
		};
		var html = new EJS({url: dirViews + 'accueil.ejs'}).render(data);
		$('section').empty().append(html);
		writeEcoutes();
		this.writeAnonymes();
	},
	
	writeMenu()
	{
		var data = {
			nomApp         : this.params.nomApp,
			surnom         : this.cu.surnom,
			presence       : this.cu.presence,
			nomPremierLieu : this.params.nomLieu0,
			nomLieu        : this.params.nomLieu,
			typeEncrypt    : this.cu.crypto.type,
			cleEncrypt     : this.cu.crypto.key
		};
		var html = new EJS({url: dirViews + 'menu.ejs'}).render(data);
		$('#menu').replaceWith(html);
	},

	writeAnonymes()
	{
		$('#nbAnonymes').empty().append(this.nbAnonymes);
	},
	
	writeUsers()
	{
		for (i=0; i < this.lieux.length; i++) {
			if (i == this.cu.ecoute || (i == 0 && this.params.premierLieuPublic))
				$('#discutLieu'+i).empty();
			this.lieux[i].writeUsers();
		}
	},

	writeUsersMenu()
	{
		this.lieux[this.cu.presence].writeUsersMenu();
	},

	writeLieux()
	{
		$('#lieux').empty();
		var cu = this.cu;
		this.lieux.forEach(function(lieu) {
			lieu.write(cu);
		});
	},

	writeMenuLieux()
	{
		if (this.lieux.length < this.params.nbLieuxMax || this.params.nbLieuxMax == 0) {
			writeMenuLieux();
		}
	}
}