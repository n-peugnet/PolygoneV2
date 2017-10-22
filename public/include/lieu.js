/** Class representing a place */
class Lieu
{
	static setNomLieu(nom)
	{
		Lieu.nomLieu = nom;
	}

	/**
	 * Creates a place.
	 * @param {number} num - The new place's number.
	 * @param {string} nom - The new place's name. (optionnal)
	 * @param {User[]} users - Users in this place.
	 * @param {number} taille - The new place's size. (default 6)
	 * @param {string} protection - The new place's protection method (default "none")
	 */
	constructor(num, users = [], taille = 6, nom = "", protection = 'none')
	{
		this.num = num;
		this.users = users;
		this.taille = taille;
		this.nom = nom;
		this.protection = protection;
	}
	
	containsUser(surnom)
	{
		return this.users.map(function(u) {return u.surnom; }).includes(surnom);
	}
	
	/**
	 * Get a user's index in the place he is, based on it's nickname.
	 * @param {string} surnom - The user's nickname.
	 * @return {number} The user's index.
	 */
	indexOfUser(surnom)
	{
		return this.users.findIndex(function(u) {return u.surnom == surnom; });
	}
	
	/**
	 * finds a user based on its presence and its nickname
	 * @param {string} surnom - the user's nickname
	 * @return {User}
	 */
	getUser(surnom)
	{
		var index = this.indexOfUser(surnom);
		return this.users[index];
	}
	
	addUser(surnom, ecoute, couleur, current)
	{
		if (this.containsUser(surnom)){
			this.getUser(surnom).reactivateIn(this.num, couleur, current);
		} else {
			var newUser = new User (surnom, ecoute, couleur, current).writeIn(this.num);
			this.moveUserIn(newUser);
		}
	}

	/**
	 * 
	 * @param {string} surnom 
	 * @returns {User}
	 */
	removeUser(surnom)
	{
		return this.users.splice(this.indexOfUser(surnom),1)[0];
	}

	moveUserIn(user)
	{
		return this.users.push(user) - 1;
	}

	/**
	 * Get an arry of users which nick name starts with the letters given.
	 * @param {string} lettres - The firsts letters we are looking for.
	 * @return {array} - An array of users.
	 */
	usersStartingWith(lettres)
	{
		var liste = [];
		lettres = lettres.toLowerCase();
		this.forEach(function(u){
			if(!u.current && u.actif) {
				let firstLetters = u.surnom.substr(0, lettres.length).toLowerCase();
				if(firstLetters == lettres)
					liste.push(u);
			}
		})
		return liste;
	}
	
	writeUsers()
	{
		var self = this;
		this.users.forEach(function(u) {
			u.writeIn(self.num);
		});
	}
	
	writeUsersMenu()
	{
		this.users.forEach(function(u){
			if (!u.current && u.actif)
				u.writeMenu();
		});
	}

	write(cu)
	{
		var data = {
			nomLieu  : Lieu.nomLieu,
			num      : this.num,
			nom      : this.nom,
			taille   : this.taille,
			presence : cu.presence,
			ecoute   : cu.ecoute,
			loggedIn : cu.loggedIn
		};
		var tmpl = 'lieu.ejs';
		if (this.num == 0) {
			tmpl = 'lieu0.ejs'
		}
		var html = new EJS({url: dirViews + tmpl}).render(data);
		$('#lieux').append(html);
	}
}