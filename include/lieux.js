var Lieux = {
	lieux: [[],[],[],[]],
	
	coins: function()
	{
		return this.lieux.slice(1);
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

	addUser: function(surnom, couleur, current)
	{
		this.addUserIn(surnom, 0, couleur, current);
	},
	
	addUserIn: function(surnom, lieu, couleur, current)
	{
		var current = surnom == CrntUser.surnom;
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
		this.lieux[lDepart][iDepart].ecoute = lArrivee;
		var user = this.lieux[lDepart][iDepart];
		var iArrivee = this.lieux[lArrivee].push(this.lieux[lDepart].splice(iDepart,1)[0])-1;
		if (surnom != CrntUser.surnom)
		{
			user.eraseIn(lDepart);
			user.writeIn(lArrivee)
		}
	},
	
	focusUser: function(surnom, pres, ecoute)
	{
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
			if (i != CrntUser.ecoute){
				writeCoin(i, 6);
			}
		}
	}
}