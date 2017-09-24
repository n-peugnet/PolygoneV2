/** Class representing a place */
class Lieu extends Array
{
	/**
	 * Creates a place.
	 * @param {string} nom - The new place's name. (optionnal)
	 * @param {int} taille - The new place's size. (default 6)
	 * @param {Encryption} encryption - The new place's encryption method (default "none")
	 */
	constructor(taille = 6, nom = "", encryption = new Encryption())
	{
		super();
		this.taille = taille;
		this.nom = nom;
		this.encryption = encryption;
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
		var data = {num, nom: this.nom, taille: this.taille, presence: App.cu.presence, loggedIn: App.cu.loggedIn};
		var html = new EJS({url: dirViews + 'coin.ejs'}).render(data);
		$('#coins').append(html);
	}
}