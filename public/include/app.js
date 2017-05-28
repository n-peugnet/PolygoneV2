var App = {
	lieux: [[],[],[],[]],
	nbAnonymes: 0,
	cu : {                // current user informations
		memoire: [],
		loggedIn: false,
		prenom: "",
		surnom: "",
		couleur: "",
		presence: 0,
		ecoute: 0
	},
	
	coins: function()
	{
		return this.lieux.slice(1);
	},
	
	allUsers: function()
	{
		var listeUsers = [];
		this.lieux.forEach(function(lieu) {
			listeUsers = listeUsers.concat(lieu);
		});
		return listeUsers;
	},
	
	usersListeningTo: function(lieu)
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
	
	addLieu: function()
	{
		i = this.lieux.push([])-1;
		writeCoin(i, 6);
	},
	
	delLastLieu: function()
	{
		console.log('del Lieu')
		this.delLieu(this.lieux.length - 1);
	},
	
	delLieu: function(lieu)
	{
		this.lieux.splice(lieu, 1);
		eraseCoin(lieu);
	},
	
	addMemory: function(persCite, citation)
	{
		newCitation = Object.create(Citation);
		newCitation.initCitation(this.cu.memoire.idGen(), persCite, citation);
		this.cu.memoire.push(newCitation);
		newCitation.write();
	},
	
	getMemory: function(id)
	{
		return this.cu.memoire.find(function(m){ return m.id == id; });
	},
	
	storeId: function(prenom, surnom)
	{
		this.cu.prenom = prenom;
		this.cu.surnom = surnom;
	},
	
	reconnect: function()
	{
		var prenom = this.cu.prenom;
		var surnom = this.cu.surnom;
		if (prenom != '' && surnom != '')
			socket.emit('logIn', {prenom, surnom});
	},
	
	logInCUser: function(couleur)
	{
		this.cu.loggedIn = true;
		this.cu.couleur = couleur;
		this.addUser(this.cu.surnom, couleur)
	},
	
	logOutCUser: function()
	{
		this.cu.loggedIn = false;
		this.goTo(0);
		this.delUser(this.cu.surnom, this.cu.presence);
	},
	
	goTo: function(dest)
	{
		this.moveUser(this.cu.surnom, this.cu.presence, dest);
		this.cu.presence = dest;
		this.cu.ecoute = dest;		
	},
	
	listenTo: function(lieu)
	{
		this.focusUser(this.cu.surnom, this.cu.presence, lieu);
		this.cu.ecoute = lieu;		
	},
	
	initAnonymes: function(nb)
	{
		this.nbAnonymes = nb;
		this.writeAnonymes();
	},
	
	addAnonyme: function()
	{
		this.nbAnonymes ++;
		this.writeAnonymes();
	},
	
	rmvAnonyme: function()
	{
		this.nbAnonymes --;
		this.writeAnonymes();
	},

	addUser: function(surnom, couleur)
	{
		this.addUserIn(surnom, 0, 0, couleur);
		this.rmvAnonyme();
	},
	
	addUserIn: function(surnom, pres, ecoute, couleur)
	{
		console.log(surnom, pres, ecoute, couleur);
		var current = surnom == this.cu.surnom && this.cu.loggedIn; //determine si l'utilisateur est bien l'utilisateur courant
		if (this.containsUser(surnom, pres)){
			this.lieux[pres][this.indexOfUser(surnom, pres)].reactivateIn(pres, couleur, current);
		} else {
			newUser = Object.create(User);
			newUser.init(surnom, ecoute, couleur, current)
				   .writeIn(pres);
			this.lieux[pres].push(newUser)-1;
		}
	},
	
	containsUser: function(surnom, lieu)
	{
		return this.lieux[lieu].map(function(u) {return u.surnom; }).includes(surnom);
	},
	
	isUserLoggedIn: function(surnom)
	{
		var user = this.getUser(surnom);
		if (user !== undefined)
		{
			if (user.actif)
				return true;
		}
		return false;
	},
	
	indexOfUser: function(surnom, lieu)
	{
		return this.lieux[lieu].findIndex(function(u) {return u.surnom == surnom; });
	},
	
	getUserIn: function(surnom, lieu)
	{
		index  = this.indexOfUser(surnom, lieu);
		return this.lieux[lieu][index];
	},
	
	getUser: function(surnom)
	{
		return this.allUsers().find(function(u) {return u.surnom == surnom; });
	},
	
	delUser: function(surnom, lieu)
	{
		var self = this;
		this.moveUser(surnom, lieu, 0);
		var index = this.indexOfUser(surnom, 0);
		this.lieux[0][index].disableIn(0);
		this.addAnonyme();
		setTimeout(function(){
			if(!self.lieux[0][index].actif){
				self.lieux[0][index].eraseIn(0);
				self.lieux[0].splice(index,1);
			}
		}, 17000);
	},

	moveUser: function(surnom, lDepart, lArrivee)
	{
		var index = this.indexOfUser(surnom, lDepart);
		var user = this.lieux[lDepart].splice(index,1)[0];
		var ecoutePre = user.ecoute;
		user.ecoute = lArrivee;
		if ( ecoutePre == this.cu.ecoute)
			writeEcoutes();
		this.lieux[lArrivee].push(user);
		if (!user.current)
		{
			user.eraseIn(lDepart);
			user.writeIn(lArrivee);
		}
	},
	
	focusUser: function(surnom, pres, ecoute)
	{
		var ecoutePre = this.getUserIn(surnom, pres).ecoute
		this.getUserIn(surnom, pres).ecoute = ecoute
		if (ecoute == this.cu.ecoute || ecoutePre == this.cu.ecoute) {
			writeEcoutes();
		}
	}, 

	writeAnonymes: function()
	{
		$('#nbAnonymes').empty().append(this.nbAnonymes);
	},
	
	writeUsers: function()
	{
		for (i=0; i < this.lieux.length; i++) {
			$('#lieu'+i).empty();
			this.lieux[i].forEach(function(u) {
				u.writeIn(i);
			});
		}
	},
		
	writeCoins: function()
	{
		$('#coins').empty();
		for (i=1; i < this.lieux.length; i++) {
			if (i != this.cu.ecoute){
				writeCoin(i, 6);
			}
		}
	}
}