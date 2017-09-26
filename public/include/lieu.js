/** Class representing a place */
class Lieu extends Array
{
	static setNomLieux(nom)
	{
		Lieu.nomLieux = nom;
	}

	/**
	 * Creates a place.
	 * @param {string} nom - The new place's name. (optionnal)
	 * @param {int} taille - The new place's size. (default 6)
	 * @param {string} protection - The new place's protection method (default "none")
	 */
	constructor(taille = 6, nom = "", protection = 'none')
	{
		super();
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

	writeCoin(num)
	{
		var data = {
			nomLieux : Lieu.nomLieux,
			num,
			nom      : this.nom,
			taille   : this.taille,
			presence : App.cu.presence,
			loggedIn : App.cu.loggedIn
		};
		var html = new EJS({url: dirViews + 'lieu.ejs'}).render(data);
		$('#coins').append(html);
	}
}