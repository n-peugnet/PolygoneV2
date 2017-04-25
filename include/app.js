var App = {
	lieux: [[],[],[],[]],
	// current user informations
	cu : {
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
	
	usersListeningTo(lieu)
	{
		var listeUsers = [];
		this.lieux.forEach(function(l, numLieu) {
			if (numLieu != lieu){
				l.forEach(function(u){
					if (u.ecoute == lieu)
						listeUsers.push(this)
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
	
	logInCUser: function(couleur)
	{
		this.addUser(this.cu.surnom, couleur)
		this.cu.loggedIn = true;
		this.cu.couleur = couleur;
	},

	addUser: function(surnom, couleur)
	{
		this.addUserIn(surnom, 0, couleur);
	},
	
	addUserIn: function(surnom, lieu, couleur)
	{
		var current = surnom == this.cu.surnom;
		if (this.containsUser(surnom, lieu)){
			this.lieux[lieu][this.indexOfUser(surnom, lieu)].reactivateIn(lieu, couleur);
		} else {
			newUser = Object.create(User);
			newUser.init(surnom, couleur, current);
			var indexUser = this.lieux[lieu].push(newUser)-1;
			newUser.writeIn(lieu);
		}
	},
	
	containsUser: function(surnom, lieu)
	{
		return this.lieux[lieu].map(function(u) {return u.surnom; }).includes(surnom);
	},
	
	indexOfUser: function(surnom, lieu)
	{
		return this.lieux[lieu].map(function(u) {return u.surnom; }).indexOf(surnom);
	},
	
	selectUser: function(surnom, lieu)
	{
		index  = this.indexOfUser(surnom, lieu);
		return this.lieux[lieu][index];
	},
	
	delUser: function(surnom, lieu)
	{
		var self = this;
		var index = this.indexOfUser(surnom, lieu);
		this.lieux[lieu][index].disableIn(lieu);
		setTimeout(function(){
			if(!self.lieux[lieu][index].actif){
				self.lieux[lieu][index].eraseIn(lieu);
				self.lieux[lieu].splice(index,1)
			}
		}, 17000);
	},

	moveUser: function(surnom, lDepart, lArrivee)
	{
		var iDepart = this.indexOfUser(surnom, lDepart);
		var user = this.lieux[lDepart].splice(iDepart,1)[0];
		user.ecoute = lArrivee;
		var iArrivee = this.lieux[lArrivee].push(user)-1;
		if (!user.current)
		{
			user.eraseIn(lDepart);
			user.writeIn(lArrivee)
		}
	},
	
	focusUser: function(surnom, pres, ecoute)
	{
		var ecoutePre = this.selectUser(surnom, pres).ecoute
		if (ecoute == this.cu.ecoute || this.selectUser(surnom, pres).ecoute == this.cu.ecoute) {
			writeEcoutes();
		}
		this.selectUser(surnom, pres).ecoute = ecoute
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