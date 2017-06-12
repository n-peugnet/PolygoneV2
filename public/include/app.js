/** @namespace */
var App = {
	lieux: [new Lieu("centre")],  // List of the different places.
	nbAnonymes: 0,
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
		presence: 0,
		ecoute: 0
	},
	
	coins()
	{
		return this.lieux.slice(1);
	},
	
	allUsers()
	{
		var listeUsers = [];
		this.lieux.forEach(function(lieu) {
			listeUsers = listeUsers.concat(lieu);
		});
		return listeUsers;
	},
	
	usersListeningTo(lieu)
	{
		var listeUsers = [];
		this.lieux.forEach(function(l, numLieu) {
			if (numLieu != lieu){
				l.forEach(function(u){
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
		var newLieu = new Lieu();
		i = this.lieux.push(newLieu)-1;
		newLieu.writeCoin(i);
	},
	
	delLastLieu()
	{
		this.delLieu(this.lieux.length - 1);
	},
	
	delLieu(lieu)
	{
		this.lieux.splice(lieu, 1);
		eraseCoin(lieu);
	},
	
	addMemory(persCite, citation)
	{
		var newCitation = new Citation(idGen(this.cu.memoire), persCite, citation).write();
		this.cu.memoire.push(newCitation);
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
		if (this.containsUser(surnom, pres)){
			this.lieux[pres][this.indexOfUser(surnom, pres)].reactivateIn(pres, couleur, current);
		} else {
			var newUser = new User (surnom, ecoute, couleur, current).writeIn(pres);
			this.lieux[pres].push(newUser);
		}
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
	
	containsUser(surnom, lieu)
	{
		return this.lieux[lieu].map(function(u) {return u.surnom; }).includes(surnom);
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
	 * Get a user's index in the place he is, based on it's nickname.
	 * @param {string} surnom - The user's nickname.
	 * @param {number} lieu - The user's place.
	 * @return {number} The user's index.
	 */
	indexOfUser(surnom, lieu)
	{
		return this.lieux[lieu].findIndex(function(u) {return u.surnom == surnom; });
	},
	
	getUserIn(surnom, lieu)
	{
		index = this.indexOfUser(surnom, lieu);
		return this.lieux[lieu][index];
	},
	
	getUser(surnom)
	{
		return this.allUsers().find(function(u) {return u.surnom == surnom; });
	},
	
	delUser(surnom, lieu)
	{
		var self = this;
		var index = this.indexOfUser(surnom, lieu);
		this.lieux[lieu][index].disableIn(lieu);
		index = this.moveUser(surnom, lieu, 0);
		this.addAnonyme();
		setTimeout(function(){
			if(!self.lieux[0][index].actif){
				self.lieux[0][index].eraseIn(0);
				self.lieux[0].splice(index,1);
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
		var index = this.indexOfUser(surnom, lDepart);
		var user = this.lieux[lDepart].splice(index,1)[0];
		var ecoutePre = user.ecoute;
		user.ecoute = lArrivee;
		if ( ecoutePre == this.cu.ecoute)
			writeEcoutes();
		index = this.lieux[lArrivee].push(user) - 1;
		if (!user.current)
		{
			user.eraseIn(lDepart);
			user.writeIn(lArrivee);
			if (lArrivee == this.cu.presence && user.actif)
				this.sons.user.play();
		}
		return index;
	},
	
	focusUser(surnom, pres, ecoute)
	{
		var ecoutePre = this.getUserIn(surnom, pres).ecoute
		this.getUserIn(surnom, pres).ecoute = ecoute
		if (ecoute == this.cu.ecoute || ecoutePre == this.cu.ecoute) {
			writeEcoutes();
		}
	},

	writeAnonymes()
	{
		$('#nbAnonymes').empty().append(this.nbAnonymes);
	},
	
	writeUsers()
	{
		for (i=0; i < this.lieux.length; i++) {
			$('#lieu'+i).empty();
			this.lieux[i].forEach(function(u) {
				u.writeIn(i);
			});
		}
	},

	writeUsersMenu()
	{
		this.lieux[this.cu.presence].forEach(function(u){
			if (!u.current && u.actif)
				u.writeMenu();
		});
	},
		
	writeCoins()
	{
		$('#coins').empty();
		for (i=1; i < this.lieux.length; i++) {
			if (i != this.cu.ecoute){
				this.lieux[i].writeCoin(i);
			}
		}
	}
}