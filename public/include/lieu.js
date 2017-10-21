/** Class representing a place */
class Lieu extends Array
{
	static setNomLieu(nom)
	{
		Lieu.nomLieu = nom;
	}

	/**
	 * Creates a place.
	 * @param {int} num - The new place's number.
	 * @param {string} nom - The new place's name. (optionnal)
	 * @param {User[]} users - Users in this place.
	 * @param {int} taille - The new place's size. (default 6)
	 * @param {string} protection - The new place's protection method (default "none")
	 */
	constructor(num, users = [], taille = 6, nom = "", protection = 'none')
	{
		super();
		this.num = num;
		this.users = users;
		this.taille = taille;
		this.nom = nom;
		this.protection = protection;
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